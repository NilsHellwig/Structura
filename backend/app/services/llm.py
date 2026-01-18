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


def _csv_to_regex(format_spec: str) -> str:
    """Convert a CSV spec to a regex pattern. Spec can be a comma-separated list of column names or empty for free table."""
    if not format_spec or format_spec.strip() == "":
        # Generic CSV: multiple lines of comma-separated content
        return r"([^,\n]+,)*[^,\n]+(\n([^,\n]+,)*[^,\n]+)*"
    
    try:
        columns = [c.strip() for c in format_spec.split(",")]
        # Header line (literal)
        header_regex = r"\s*".join([re.escape(c) for c in columns])
        # Replace the joins with proper comma escaping
        header_regex = ",".join([re.escape(c) for c in columns])
        
        # Cell regex: anything but comma or newline
        cell = r"[^,\n]+"
        # Row regex: n cells separated by n-1 commas
        row_cells = ",".join([cell] * len(columns))
        
        # Complete regex: Header \n (Row \n)*
        return f"{header_regex}\n({row_cells}\n?)*"
    except Exception:
        # Fallback to generic
        return r"([^,\n]+,)*[^,\n]+(\n([^,\n]+,)*[^,\n]+)*"


def _template_to_regex(template: str) -> str:
    """Convert a template with [GEN] placeholders to a regex pattern"""
    if not template:
        return ".+"
    
    # Decode escape sequences like \n to actual characters
    if '\\n' in template or '\\t' in template:
        template = template.encode().decode('unicode_escape')
    
    # Split by [GEN]
    parts = template.split("[GEN]")
    # Escape special regex characters in each part
    escaped_parts = []
    for part in parts:
        # Escape regex special chars
        escaped = part
        for char in r'\.^$*+?{}[]|()':
            escaped = escaped.replace(char, '\\' + char)
        escaped_parts.append(escaped)
    
    # Join with .+ which matches any content (non-greedy to respect structure)
    regex = ".+?".join(escaped_parts)
    
    # Make it match from start to end
    return regex


def _get_format_instruction(output_format: OutputFormat, format_spec: str) -> str:
    """Generate clear format instruction for the LLM based on output format"""
    if output_format == OutputFormat.template:
        # Decode escape sequences like \n to actual newlines for display
        display_template = format_spec.encode().decode('unicode_escape') if '\\n' in format_spec else format_spec
        example = display_template.replace("[GEN]", "[content here]")
        return (
            f"You must respond ONLY in this EXACT format:\n{display_template}\n\n"
            f"Replace [GEN] with appropriate content. Example result:\n{example}\n"
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
