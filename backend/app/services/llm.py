from typing import List, Dict, Any, AsyncGenerator, Optional
from app.schemas.message import OutputFormat, LLMBackend
from openai import AsyncOpenAI
import os
import json
import re
import httpx


def _fix_url(url: str) -> str:
    """Replace localhost with host.docker.internal when running in Docker (macOS/Windows support)"""
    if os.path.exists("/.dockerenv") and "localhost" in url:
        return url.replace("localhost", "host.docker.internal")
    return url


def _get_openai_client(backend: LLMBackend, parameters: Dict[str, Any]) -> AsyncOpenAI:
    """Get the appropriate OpenAI-compatible client for the backend"""
    if backend == LLMBackend.openai:
        api_key = parameters.get("api_key") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not provided")
        return AsyncOpenAI(api_key=api_key)
    
    elif backend == LLMBackend.vllm:
        base_url = parameters.get("base_url") or "http://localhost:8000/v1"
        base_url = _fix_url(base_url)
        if not base_url.endswith("/v1") and not base_url.endswith("/v1/"):
            base_url = base_url.rstrip("/") + "/v1"
        return AsyncOpenAI(base_url=base_url, api_key="vllm-key")
    
    elif backend == LLMBackend.ollama:
        base_url = parameters.get("base_url") or "http://localhost:11434/v1"
        base_url = _fix_url(base_url)
        if not base_url.endswith("/v1") and not base_url.endswith("/v1/"):
            base_url = base_url.rstrip("/") + "/v1"
        return AsyncOpenAI(base_url=base_url, api_key="ollama")
    
    else:
        raise ValueError(f"Unsupported backend for OpenAI client: {backend}")


async def generate_llm_response(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, Any]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> Dict[str, str]:
    """Generate non-streaming response from LLM based on backend and format using OpenAI SDK where possible"""
    
    # Pre-process messages
    processed_messages = messages

    if backend == LLMBackend.ollama:
        agg_content = ""
        async for chunk in generate_llm_response_stream(backend, model, messages, output_format, format_spec, parameters):
            if "content" in chunk: agg_content += chunk["content"]
        return {"content": agg_content}

    client = _get_openai_client(backend, parameters)
    
    request_params = {
        "model": model,
        "messages": processed_messages,
        "temperature": float(parameters.get("temperature", 0.7)),
        "max_tokens": int(parameters.get("max_tokens", 1024)),
    }
    
    for param in ["top_p", "frequency_penalty", "presence_penalty", "seed"]:
        if param in parameters and parameters[param] is not None:
            request_params[param] = parameters[param]

    if output_format != OutputFormat.default and format_spec:
        format_instruction = _get_format_instruction(output_format, format_spec)
        messages_copy = list(processed_messages)
        if messages_copy and messages_copy[0].get("role") == "system":
            messages_copy[0] = {
                "role": "system",
                "content": format_instruction + "\n\n" + messages_copy[0]["content"]
            }
        else:
            messages_copy.insert(0, {"role": "system", "content": format_instruction})
        request_params["messages"] = messages_copy
    
    if output_format == OutputFormat.json and format_spec:
        try:
            schema = json.loads(format_spec)
            # Only use strict json_schema for OpenAI
            if backend == LLMBackend.openai:
                request_params["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {"name": "response", "schema": schema, "strict": True}
                }
            elif backend == LLMBackend.vllm:
                request_params["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {"name": "response", "schema": schema}
                }
            else:
                request_params["response_format"] = {"type": "json_object"}
        except:
            request_params["response_format"] = {"type": "json_object"}
    
    if backend == LLMBackend.vllm:
        if "extra_body" not in request_params: request_params["extra_body"] = {}
        if output_format == OutputFormat.regex and format_spec:
            request_params["extra_body"]["structured_outputs"] = {"regex": format_spec}
        elif output_format == OutputFormat.template and format_spec:
            request_params["extra_body"]["structured_outputs"] = {"regex": _template_to_regex(format_spec)}
        elif output_format == OutputFormat.html:
            request_params["extra_body"]["structured_outputs"] = {"regex": r"\s*<[!?a-zA-Z].*"}
        elif output_format == OutputFormat.csv:
            request_params["extra_body"]["structured_outputs"] = {"regex": _csv_to_regex(format_spec or "")}

    response = await client.chat.completions.create(**request_params)
    msg = response.choices[0].message
    content = msg.content or ""
    
    return {"content": content}


async def generate_llm_response_stream(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, Any]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> AsyncGenerator[Dict[str, str], None]:
    """Generate streaming response from LLM based on backend and format using OpenAI SDK where possible"""
    # Create a shallow copy to avoid modifying the original list
    processed_messages = list(messages)
    
    if output_format != OutputFormat.default and format_spec:
        # Avoid double-adding instructions if they are already in the last user message or system prompt
        last_msg = processed_messages[-1] if processed_messages else {}
        last_msg_content = last_msg.get("content", "")
        last_text = ""
        if isinstance(last_msg_content, str): last_text = last_msg_content
        elif isinstance(last_msg_content, list):
            for part in last_msg_content:
                if isinstance(part, dict) and part.get("type") == "text":
                    last_text = part.get("text", "")
                    break

        if "%-%-%" not in last_text: # Marker check if we ever add one
            format_instruction = _get_format_instruction(output_format, format_spec)
            if processed_messages and processed_messages[0].get("role") == "system":
                processed_messages[0] = {
                    "role": "system",
                    "content": format_instruction + "\n\n" + processed_messages[0]["content"]
                }
            else:
                processed_messages.insert(0, {"role": "system", "content": format_instruction})

    if backend == LLMBackend.ollama:
        stream_gen = _generate_ollama_stream_native(model, processed_messages, output_format, format_spec, parameters)
    else:
        stream_gen = _generate_openai_compatible_stream(backend, model, processed_messages, output_format, format_spec, parameters)

    async for raw_chunk in stream_gen:
        if isinstance(raw_chunk, dict):
            # Extract content text
            chunk_text = raw_chunk.get("content", "")
            
            # Yield any other metadata (like message IDs)
            other_meta = {k: v for k, v in raw_chunk.items() if k not in ["content"]}
            if other_meta:
                yield other_meta
                
            if chunk_text:
                yield {"content": chunk_text}
        else:
            yield {"content": raw_chunk}


async def _generate_openai_compatible_stream(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, Any]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> AsyncGenerator[Any, None]:
    client = _get_openai_client(backend, parameters)
    request_params = {
        "model": model,
        "messages": messages,
        "temperature": float(parameters.get("temperature", 0.7)),
        "max_tokens": int(parameters.get("max_tokens", 1024)),
        "stream": True,
    }

    for param in ["top_p", "frequency_penalty", "presence_penalty", "seed"]:
        if param in parameters and parameters[param] is not None:
            request_params[param] = parameters[param]
    
    if "stop" in parameters and parameters["stop"] is not None:
        request_params["stop"] = parameters["stop"]
    elif output_format == OutputFormat.template and format_spec:
        # Extract literals from template to use as stop sequences
        # This is very helpful for templates to know when a GEN part ends
        parts = format_spec.split("[GEN]")
        stops = []
        for p in parts[1:]:
            if not p: continue
            # Take the first few characters of the static text following [GEN]
            # Ollama/vLLM like short stop sequences
            stop_candidate = p.split("\n")[0].strip()
            if stop_candidate:
                stops.append(stop_candidate[:20]) # Limit length
        if stops: 
            # If there's a final static part, that's a good stop
            if parts[-1].strip():
                stops.append(parts[-1].strip()[:20])
            request_params["stop"] = list(set(stops))

    if "custom_params" in parameters and isinstance(parameters["custom_params"], dict):
        for k, v in parameters["custom_params"].items():
            request_params[k] = v
    
    if output_format == OutputFormat.json and format_spec:
        try:
            schema = json.loads(format_spec)
            if backend == LLMBackend.openai:
                request_params["response_format"] = {
                    "type": "json_schema", 
                    "json_schema": {"name": "response", "schema": schema, "strict": True}
                }
            elif backend == LLMBackend.vllm:
                # vLLM supports json_schema in a similar way
                request_params["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {"name": "response", "schema": schema}
                }
            else:
                request_params["response_format"] = {"type": "json_object"}
        except:
            request_params["response_format"] = {"type": "json_object"}
    
    if backend == LLMBackend.vllm:
        if "extra_body" not in request_params: request_params["extra_body"] = {}
        if output_format == OutputFormat.regex and format_spec:
            request_params["extra_body"]["structured_outputs"] = {"regex": format_spec}
        elif output_format == OutputFormat.template and format_spec:
            request_params["extra_body"]["structured_outputs"] = {"regex": _template_to_regex(format_spec)}
        elif output_format == OutputFormat.html:
            request_params["extra_body"]["structured_outputs"] = {"regex": r"\s*<[!?a-zA-Z].*"}
        elif output_format == OutputFormat.csv:
            request_params["extra_body"]["structured_outputs"] = {"regex": _csv_to_regex(format_spec or "")}

    stream = await client.chat.completions.create(**request_params)
    async for chunk in stream:
        if not chunk.choices: continue
        delta = chunk.choices[0].delta
        if delta.content:
            yield {"content": delta.content}


async def _generate_ollama_stream_native(
    model: str,
    messages: List[Dict[str, Any]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    base_url = (parameters.get("base_url") or "http://localhost:11434").replace("/v1", "").rstrip("/")
    base_url = _fix_url(base_url)
    url = f"{base_url}/api/chat"
    
    stops = []
    if "stop" in parameters and parameters["stop"]:
        stops = parameters["stop"] if isinstance(parameters["stop"], list) else [parameters["stop"]]
    elif output_format == OutputFormat.template and format_spec:
        parts = format_spec.split("[GEN]")
        stops = [p.split("\n")[0] for p in parts[1:] if p and p.split("\n")[0].strip()]

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": float(parameters.get("temperature", 0.7)),
            "num_predict": int(parameters.get("max_tokens", 1024)),
            "top_p": float(parameters.get("top_p", 1.0)),
            "seed": parameters.get("seed"),
            "stop": stops if stops else None,
            "num_ctx": parameters.get("num_ctx", 4096),
        }
    }
    
    if "custom_params" in parameters and isinstance(parameters["custom_params"], dict):
        for k, v in parameters["custom_params"].items():
            payload["options"][k] = v
    
    payload["format"] = _build_ollama_format(output_format, format_spec)
    
    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
        try:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    try:
                        error_data = await response.aread()
                        yield f"Ollama Error ({response.status_code}): {error_data.decode()}"
                    except:
                        yield f"Ollama Error ({response.status_code})"
                    return

                is_first = True
                async for line in response.aiter_lines():
                    if not line: continue
                    try:
                        chunk = json.loads(line)
                        if "error" in chunk:
                            yield f"Ollama Error: {chunk['error']}"
                            break
                        if "message" in chunk and "content" in chunk["message"]:
                            content_chunk = chunk["message"]["content"]
                            
                            if is_first:
                                if output_format not in [OutputFormat.default, OutputFormat.json]:
                                    content_chunk = content_chunk.lstrip()
                                    if content_chunk.startswith('"'):
                                        content_chunk = content_chunk[1:]
                                    if not content_chunk:
                                        continue
                                is_first = False
                            
                            if output_format not in [OutputFormat.default, OutputFormat.json]:
                                if chunk.get("done") or (content_chunk.endswith('"') and len(content_chunk) > 0):
                                    if content_chunk.endswith('"'):
                                        if len(content_chunk) < 2 or content_chunk[-2] != '\\':
                                            content_chunk = content_chunk[:-1]
                            
                            if content_chunk:
                                # Safe replacement for Ollama's string escaping
                                content_chunk = content_chunk.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')
                                yield content_chunk
                        
                        if chunk.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            yield f"Connection Error: {str(e)}"


def _get_format_instruction(output_format: OutputFormat, format_spec: str) -> str:
    """Generate clear format instruction for the LLM based on output format"""
    if output_format == OutputFormat.template:
        # Safe replacement for common escapes
        display_template = format_spec.replace("\\n", "\n").replace("\\t", "\t")
        return (
            f"Your response must look exactly like this:\n```\n{display_template}\n```\n\n"
            f"Replace the entire [GEN] tag with appropriate text content. No conversational filler."
        )
    elif output_format == OutputFormat.regex:
        return f"Your response must match this exact pattern: {format_spec}\nNo conversational filler."
    elif output_format == OutputFormat.json:
        if format_spec:
            try:
                # Clean up JSON for prompt
                schema = json.loads(format_spec)
                return f"You must respond with valid JSON only. The output must strictly follow this JSON schema:\n```json\n{json.dumps(schema, indent=2)}\n```\n\nDo not add any explanations or extra text outside the JSON object."
            except:
                pass
        return "You must respond with valid JSON only."
    elif output_format == OutputFormat.html:
        return "You must respond with valid XML/HTML only."
    elif output_format == OutputFormat.csv:
        return f"You must respond in CSV format with these columns: {format_spec}." if format_spec else "You must respond in valid CSV format."
    return ""


def _template_to_regex(template: str) -> str:
    if not template: return ".*"
    # Escaping everything but the [GEN] markers
    # We want to match the static text literally
    parts = template.split("[GEN]")
    escaped_parts = []
    for p in parts:
        # Escape regex special chars in the static part
        escaped = re.escape(p)
        # re.escape is a bit too aggressive for things we want to keep literally in the pattern 
        # (like newlines which we want as \n or \s+ for flexibility)
        # But for Ollama/vLLM we usually need the literal match or \n
        escaped = escaped.replace("\\\n", "\\n").replace("\\\t", "\\t").replace("\\ ", " ")
        escaped_parts.append(escaped)
    
    # [GEN] becomes a match-all until the next static part
    # Use non-greedy match if there's a following static part
    res = ""
    for i, p in enumerate(escaped_parts):
        res += p
        if i < len(escaped_parts) - 1:
            # If the NEXT part is empty or starts with whitespace, 
            # we might want to be careful, but generally (.*?) works
            res += "(.*?)"
    
    return res


def _csv_to_regex(format_spec: str) -> str:
    if not format_spec: return ".*"
    columns = [c.strip() for c in format_spec.split(",")]
    header = ",".join([re.escape(c).replace('\\ ', ' ').replace('\\\\n', '\\n') for c in columns])
    return f"{header}.*"


def _build_ollama_format(output_format: OutputFormat, format_spec: str | None) -> Any:
    if output_format == OutputFormat.json:
        if format_spec:
            try:
                # For newer Ollama versions, we can pass the JSON schema directly
                return json.loads(format_spec)
            except:
                return "json"
        return "json"
    pattern = None
    if output_format == OutputFormat.regex and format_spec:
        pattern = format_spec.replace('\\ ', ' ').replace("\n", "\\n").replace("\t", "\\t")
    elif output_format == OutputFormat.template and format_spec:
        # Templates are tricky with Ollama, let's use the template logic but ensure it's simple
        pattern = _template_to_regex(format_spec)
        # For Ollama, the prefix must be absolute sometimes to trigger correctly
    elif output_format == OutputFormat.csv:
        pattern = _csv_to_regex(format_spec or "")
    elif output_format == OutputFormat.html:
        pattern = r".*<[!a-zA-Z].*"
    
    if pattern:
        # Do not force ^ and $ for everything, especially if they are already there
        # But for templates, we want the WHOLE response to match
        if not pattern.startswith('^'): pattern = '^' + pattern
        if not pattern.endswith('$'): pattern = pattern + '$'
        return {"type": "string", "pattern": pattern}
    
    return None


async def get_available_models(backend: LLMBackend, parameters: Dict[str, Any]) -> List[str]:
    # Default behavior: try OpenAI list approach
    if backend == LLMBackend.ollama and not parameters.get("base_url"):
        return await _get_ollama_models_native(parameters)

    try:
        client = _get_openai_client(backend, parameters)
        models = await client.models.list()
        if backend == LLMBackend.openai:
            return sorted([m.id for m in models.data if "gpt" in m.id.lower() or "o1" in m.id.lower()])
        return sorted([m.id for m in models.data])
    except:
        # Fallback for Ollama if OpenAI SDK failed
        if backend == LLMBackend.ollama:
            return await _get_ollama_models_native(parameters)
        return []


async def _get_ollama_models_native(parameters: Dict[str, Any]) -> List[str]:
    base_url = (parameters.get("base_url") or "http://localhost:11434").replace("/v1", "").rstrip("/")
    base_url = _fix_url(base_url)
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{base_url}/api/tags", timeout=5.0)
            data = response.json()
            return sorted([m["name"] for m in data.get("models", [])])
        except: return []
