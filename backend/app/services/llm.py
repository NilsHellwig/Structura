from typing import List, Dict, Any, AsyncGenerator
from app.schemas.message import OutputFormat, LLMBackend
from openai import AsyncOpenAI
import os
import json
import re
import httpx


def _get_openai_client(backend: LLMBackend, parameters: Dict[str, Any]) -> AsyncOpenAI:
    """Get the appropriate OpenAI-compatible client for the backend"""
    if backend == LLMBackend.openai:
        api_key = parameters.get("api_key") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not provided")
        return AsyncOpenAI(api_key=api_key)
    
    elif backend == LLMBackend.vllm:
        base_url = parameters.get("base_url") or "http://localhost:8000/v1"
        # Ensure base_url ends with /v1 if it doesn't already
        if not base_url.endswith("/v1") and not base_url.endswith("/v1/"):
            base_url = base_url.rstrip("/") + "/v1"
        return AsyncOpenAI(base_url=base_url, api_key="vllm-key")
    
    elif backend == LLMBackend.ollama:
        base_url = parameters.get("base_url") or "http://localhost:11434/v1"
        # Ensure base_url ends with /v1 for OpenAI compatibility
        if not base_url.endswith("/v1") and not base_url.endswith("/v1/"):
            base_url = base_url.rstrip("/") + "/v1"
        return AsyncOpenAI(base_url=base_url, api_key="ollama")
    
    else:
        raise ValueError(f"Unsupported backend for OpenAI client: {backend}")


async def generate_llm_response(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response from LLM based on backend and format using OpenAI SDK where possible"""
    
    if backend == LLMBackend.ollama:
        return await _generate_ollama_native(model, messages, output_format, format_spec, parameters)
    
    client = _get_openai_client(backend, parameters)
    
    # Prepare base request parameters
    request_params = {
        "model": model,
        "messages": messages,
        "temperature": float(parameters.get("temperature", 0.7)),
        "max_tokens": int(parameters.get("max_tokens", 1024)),
    }
    
    # Add format instructions to messages for better compliance
    if output_format != OutputFormat.default and format_spec:
        format_instruction = _get_format_instruction(output_format, format_spec)
        messages_copy = list(messages)
        if messages_copy and messages_copy[0].get("role") == "system":
            messages_copy[0] = {
                "role": "system",
                "content": format_instruction + "\n\n" + messages_copy[0]["content"]
            }
        else:
            messages_copy.insert(0, {"role": "system", "content": format_instruction})
        request_params["messages"] = messages_copy
    
    # Handle structured output formats
    if output_format == OutputFormat.json and format_spec:
        try:
            schema = json.loads(format_spec)
            # OpenAI supports 'json_schema' type with 'strict=True'
            # vLLM also supports OpenAI-style JSON Schema
            request_params["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "schema": schema,
                    "strict": True
                }
            }
        except json.JSONDecodeError:
            # Fallback to older response_format if it's not a valid schema
            request_params["response_format"] = {"type": "json_object"}
    
    # For vLLM, use structured_outputs with regex in extra_body
    if backend == LLMBackend.vllm:
        if output_format == OutputFormat.regex and format_spec:
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": format_spec
                }
            }
        elif output_format == OutputFormat.template and format_spec:
            # Convert template to regex for vLLM guided generation
            guided_regex = _template_to_regex(format_spec)
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": guided_regex
                }
            }
        elif output_format == OutputFormat.html:
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": r"\s*<[!?a-zA-Z].*"
                }
            }
        elif output_format == OutputFormat.csv:
            guided_regex = _csv_to_regex(format_spec or "")
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": guided_regex
                }
            }

    # Make API call
    response = await client.chat.completions.create(**request_params)
    content = response.choices[0].message.content or ""
    
    # Post-generation validation for non-native formats
    if output_format == OutputFormat.regex and format_spec and backend != LLMBackend.vllm:
        if not _validate_regex_response(content, format_spec):
            # This is a soft check, sometimes we might want to still return it
            pass
            
    return content


async def generate_llm_response_stream(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """Generate streaming response from LLM using OpenAI SDK where possible"""
    
    if backend == LLMBackend.ollama:
        async for chunk in _generate_ollama_stream_native(model, messages, output_format, format_spec, parameters):
            yield chunk
        return

    client = _get_openai_client(backend, parameters)
    
    # Prepare base request parameters
    request_params = {
        "model": model,
        "messages": messages,
        "temperature": float(parameters.get("temperature", 0.7)),
        "max_tokens": int(parameters.get("max_tokens", 1024)),
        "stream": True,
    }
    
    # Add format instructions to messages for better compliance
    if output_format != OutputFormat.default and format_spec:
        # Check if instructions are already present in the prompt (via frontend %-%-%)
        last_msg_content = messages[-1].get("content", "") if messages else ""
        if "%-%-%" not in last_msg_content:
            format_instruction = _get_format_instruction(output_format, format_spec)
            messages_copy = list(messages)
            if messages_copy and messages_copy[0].get("role") == "system":
                messages_copy[0] = {
                    "role": "system",
                    "content": format_instruction + "\n\n" + messages_copy[0]["content"]
                }
            else:
                messages_copy.insert(0, {"role": "system", "content": format_instruction})
            request_params["messages"] = messages_copy
        else:
            # If already present in user message, just add a short reinforcer to system msg
            messages_copy = list(messages)
            reinforcer = "Strictly follow the formatting instructions provided at the end of the user message. Do not add any conversational filler."
            if messages_copy and messages_copy[0].get("role") == "system":
                messages_copy[0] = {
                    "role": "system",
                    "content": reinforcer + "\n\n" + messages_copy[0]["content"]
                }
            else:
                messages_copy.insert(0, {"role": "system", "content": reinforcer})
            request_params["messages"] = messages_copy

    
    # Handle structured output formats
    if output_format == OutputFormat.json and format_spec:
        try:
            schema = json.loads(format_spec)
            # OpenAI and newer local backends support 'json_schema' type
            request_params["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "schema": schema,
                    "strict": True
                }
            }
        except json.JSONDecodeError:
            # Fallback to older response_format if it's not a valid schema
            request_params["response_format"] = {"type": "json_object"}
    
    # For vLLM, use structured_outputs with regex in extra_body
    if backend == LLMBackend.vllm:
        if output_format == OutputFormat.regex and format_spec:
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": format_spec
                }
            }
        elif output_format == OutputFormat.template and format_spec:
            # Convert template to regex for vLLM guided generation
            guided_regex = _template_to_regex(format_spec).replace('\n', '\\n')
            print(guided_regex)
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": guided_regex
                }
            }
        elif output_format == OutputFormat.html:
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": r"\s*<[!?a-zA-Z].*"
                }
            }
        elif output_format == OutputFormat.csv:
            guided_regex = _csv_to_regex(format_spec or "")
            request_params["extra_body"] = {
                "structured_outputs": {
                    "regex": guided_regex
                }
            }

    # Make streaming API call
    stream = await client.chat.completions.create(**request_params)
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


def _validate_regex_response(content: str, pattern: str) -> bool:
    """Validate that content matches regex pattern"""
    try:
        return bool(re.fullmatch(pattern, content, re.DOTALL))
    except re.error:
        return False


def _template_to_regex(template: str) -> str:
    """Convert a template with [GEN] placeholders to a regex pattern"""
    if not template:
        return ".*"
    
    # Handle literal escaped newlines from frontend
    t = template.replace('\\n', '\n').replace('\\t', '\t')
    
    parts = []
    for p in t.split("[GEN]"):
        # re.escape and we must unescape spaces and newlines for Ollama's regex engine
        escaped = re.escape(p).replace('\\ ', ' ').replace('\\\n', '\n').replace('\\\t', '\t')
        parts.append(escaped)
    return ".*".join(parts)


def _build_ollama_format(output_format: OutputFormat, format_spec: str | None) -> Any:
    """Build the format parameter for Ollama"""
    if output_format == OutputFormat.json:
        if format_spec:
            try:
                return json.loads(format_spec)
            except:
                return "json"
        return "json"
    
    pattern = None
    if output_format == OutputFormat.regex and format_spec:
        pattern = format_spec.replace('\\ ', ' ').replace('\\n', '\n').replace('\\t', '\t')
    elif output_format == OutputFormat.template and format_spec:
        pattern = _template_to_regex(format_spec)
    elif output_format == OutputFormat.csv:
        pattern = _csv_to_regex(format_spec or "")
    elif output_format == OutputFormat.html:
        pattern = r".*<[!a-zA-Z].*"

    if pattern:
        if not pattern.startswith('^'): pattern = '^' + pattern
        if not pattern.endswith('$'): pattern = pattern + '$'
        print(pattern)
        return {"type": "string", "pattern": pattern}
    
    return None


def _csv_to_regex(format_spec: str) -> str:
    """Convert a CSV spec to a regex pattern simple enough for JSON Schema patterns."""
    if not format_spec or format_spec.strip() == "":
        return r".*"
    
    try:
        columns = [c.strip() for c in format_spec.split(",")]
        # Simple header match, ensure spaces and newlines are NOT escaped
        header = ",".join([re.escape(c).replace('\\ ', ' ').replace('\\\n', '\n') for c in columns])
        # Generic row match that follows the header
        return f"{header}.*"
    except Exception:
        return r".*"


def _get_format_instruction(output_format: OutputFormat, format_spec: str) -> str:
    """Generate clear format instruction for the LLM based on output format"""
    if output_format == OutputFormat.template:
        # Safe replacement for common escapes
        display_template = format_spec.replace("\\n", "\n").replace("\\t", "\t")
        return (
            f"Your response must look exactly like this:\n```\n{display_template}\n```\n\n"
            f"Replace the entire [GEN] tag with appropriate text content. Example result:\n"
            f"Do not add any explanations, greetings, or extra text. Only output the exact format shown above."
        )
    elif output_format == OutputFormat.regex:
        return (
            f"Your response must match this exact pattern: {format_spec}\n"
            f"Do not add any explanations or extra text."
        )
    elif output_format == OutputFormat.json:
        return "You must respond with valid JSON only. Do not add any explanations or extra text outside the JSON."
    elif output_format == OutputFormat.html:
        return "You must respond with valid XML/HTML only. Do not add any explanations or extra text outside the tags."
    elif output_format == OutputFormat.csv:
        if format_spec:
            return f"You must respond in CSV format with these exact columns: {format_spec}. Do not add any explanations or extra text."
        return "You must respond in valid CSV format. Do not add any explanations or extra text."
    return ""


def _validate_template_response(content: str, template: str) -> bool:
    """Validate that content fits the template structure"""
    pattern = _template_to_regex(template)
    return _validate_regex_response(content, pattern)


async def get_available_models(backend: LLMBackend, parameters: Dict[str, Any]) -> List[str]:
    """Get available models for a backend using OpenAI-compatible API where possible"""
    
    if backend == LLMBackend.ollama and not parameters.get("base_url"):
        # Special case for Ollama's native API if no base_url for V1 is provided
        return await _get_ollama_models_native(parameters)

    try:
        client = _get_openai_client(backend, parameters)
        models = await client.models.list()
        
        if backend == LLMBackend.openai:
            return sorted([m.id for m in models.data if "gpt" in m.id.lower() or "o1" in m.id.lower()])
        
        return sorted([m.id for m in models.data])
    except Exception as e:
        print(f"Error fetching models for {backend}: {e}")
        # Fallback for Ollama if /v1/models fails
        if backend == LLMBackend.ollama:
            return await _get_ollama_models_native(parameters)
        return []


async def _get_ollama_models_native(parameters: Dict[str, Any]) -> List[str]:
    """Get available Ollama models using Ollama's native API"""
    base_url = parameters.get("base_url") or "http://localhost:11434"
    # Ensure we use the proper base URL for native API
    if "/v1" in base_url:
        base_url = base_url.replace("/v1", "")
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{base_url}/api/tags", timeout=5.0)
            response.raise_for_status()
            data = response.json()
            return sorted([model["name"] for model in data.get("models", [])])
        except Exception:
            return []


async def _generate_ollama_native(
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response from Ollama using native API"""
    base_url = parameters.get("base_url") or "http://localhost:11434"
    if "/v1" in base_url:
        base_url = base_url.replace("/v1", "")
    base_url = base_url.rstrip("/")
    
    url = f"{base_url}/api/chat"
    
    # Add format instructions to messages for better compliance
    processed_messages = list(messages)
    if output_format != OutputFormat.default and format_spec:
        format_instruction = _get_format_instruction(output_format, format_spec)
        if processed_messages and processed_messages[0].get("role") == "system":
            processed_messages[0] = {
                "role": "system",
                "content": format_instruction + "\n\n" + processed_messages[0]["content"]
            }
        else:
            processed_messages.insert(0, {"role": "system", "content": format_instruction})

    # Base payload
    payload = {
        "model": model,
        "messages": processed_messages,
        "stream": False,
        "options": {
            "temperature": float(parameters.get("temperature", 0.7)),
            "num_predict": int(parameters.get("max_tokens", 1024)),
        }
    }
    
    # Handle formats exactly as Ollama expects
    payload["format"] = _build_ollama_format(output_format, format_spec)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        content = result.get("message", {}).get("content", "")
        
        # Remove surrounding quotes if Ollama wrapped the string output
        if output_format not in [OutputFormat.default, OutputFormat.json]:
            # Ollama's format: {type: string} will return a JSON-encoded string
            # Using content.strip() + starts/endswith is more robust than just checking the raw content
            temp_content = content.strip()
            if temp_content.startswith('"') and temp_content.endswith('"'):
                # Try to use json.loads to properly unescape everything
                try:
                    content = json.loads(temp_content)
                except:
                    # Fallback to manual stripping if it's not a fully valid JSON string
                    content = temp_content[1:-1]
                    content = content.replace('\\"', '"').replace('\\n', '\n')
            else:
                # Even if no quotes, handle basic escaping
                content = content.replace('\\"', '"').replace('\\n', '\n')
            
        return content


async def _generate_ollama_stream_native(
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """Generate streaming response from Ollama using native API"""
    base_url = parameters.get("base_url") or "http://localhost:11434"
    if "/v1" in base_url:
        base_url = base_url.replace("/v1", "")
    base_url = base_url.rstrip("/")
    
    url = f"{base_url}/api/chat"
    
    print(format_spec)
    
    # Add format instructions to messages for better compliance
    processed_messages = list(messages)
    if output_format != OutputFormat.default and format_spec:
        # Check if instructions are already present in the prompt (via frontend %-%-%)
        last_msg_content = messages[-1].get("content", "") if messages else ""
        if "%-%-%" not in last_msg_content:
            format_instruction = _get_format_instruction(output_format, format_spec)
            if processed_messages and processed_messages[0].get("role") == "system":
                processed_messages[0] = {
                    "role": "system",
                    "content": format_instruction + "\n\n" + processed_messages[0]["content"]
                }
            else:
                processed_messages.insert(0, {"role": "system", "content": format_instruction})
        else:
            # Short re-inforcer if already in user msg
            reinforcer = "Strictly follow the formatting instructions provided at the end of the user message."
            if processed_messages and processed_messages[0].get("role") == "system":
                processed_messages[0] = {
                    "role": "system",
                    "content": reinforcer + "\n\n" + processed_messages[0]["content"]
                }
            else:
                processed_messages.insert(0, {"role": "system", "content": reinforcer})

    payload = {
        "model": model,
        "messages": processed_messages,
        "stream": True,
        "options": {
            "temperature": float(parameters.get("temperature", 0.7)),
            "num_predict": int(parameters.get("max_tokens", 1024)),
        }
    }
    
    # Handle formats exactly as Ollama expects
    payload["format"] = _build_ollama_format(output_format, format_spec)
    
    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
        try:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    try:
                        error_data = await response.aread()
                        print(f"Ollama error ({response.status_code}): {error_data.decode()}")
                        yield f"Ollama Error ({response.status_code}): {error_data.decode()}"
                    except:
                        yield f"Ollama Error: Status {response.status_code}"
                    return

                is_first = True
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        if "error" in chunk:
                            yield f"Ollama Error: {chunk['error']}"
                            break
                        if "message" in chunk and "content" in chunk["message"]:
                            content_chunk = chunk["message"]["content"]
                            
                            # Handle leading quote for structured formats
                            if is_first:
                                if output_format not in [OutputFormat.default, OutputFormat.json]:
                                    # Strip any leading whitespace that might appear before the quote
                                    content_chunk = content_chunk.lstrip()
                                    if content_chunk.startswith('"'):
                                        content_chunk = content_chunk[1:]
                                    
                                    # If chunk is now empty (was only whitespace or only quote), 
                                    # we stay in is_first=True to catch the next bit
                                    if not content_chunk:
                                        continue
                                
                                # Mark as no longer the first content chunk
                                is_first = False
                            
                            # Handle trailing quote on done or if it's the very last part of a structured response
                            if output_format not in [OutputFormat.default, OutputFormat.json]:
                                # If this is the final chunk, be very aggressive about trailing quotes
                                if chunk.get("done") or (content_chunk.endswith('"') and len(content_chunk) > 0):
                                    # Check if the last character is a quote and we probably don't want it
                                    # This is tricky because the template itself could end with a quote.
                                    # However, Ollama's format: {type: string} ALWAYS wraps in quotes.
                                    if content_chunk.endswith('"'):
                                        # Only strip if it looks like the closing quote of the JSON string
                                        # (i.e., not escaped)
                                        if len(content_chunk) < 2 or content_chunk[-2] != '\\':
                                            content_chunk = content_chunk[:-1]
                            
                            if content_chunk:
                                # Ollama might escape quotes/newlines in the string output
                                content_chunk = content_chunk.replace('\\"', '"').replace('\\n', '\n')
                                yield content_chunk
                            
                        if chunk.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"Error connecting to Ollama: {e}")
            yield f"Connection Error: Could not reach Ollama at {url}. Make sure Ollama is running."
