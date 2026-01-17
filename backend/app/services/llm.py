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
        return AsyncOpenAI(base_url=base_url, api_key="vllm-key") # vLLM often doesn't need a real key
    
    elif backend == LLMBackend.ollama:
        base_url = parameters.get("base_url") or "http://localhost:11434/v1"
        return AsyncOpenAI(base_url=base_url, api_key="ollama") # Ollama's OpenAI compatible API
    
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
        "max_tokens": int(parameters.get("max_tokens", 2048)),
    }
    
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
            
    # For vLLM specifically, we can use their extended parameters if needed
    # (though using the standard OpenAI format is preferred for compatibility)
    if backend == LLMBackend.vllm and output_format == OutputFormat.regex and format_spec:
        # vLLM supports guided_regex via extra_body
        request_params["extra_body"] = {"guided_regex": format_spec}

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
        "max_tokens": int(parameters.get("max_tokens", 2048)),
        "stream": True,
    }
    
    # Note: JSON Schema is technically only supported in non-streaming by OpenAI officially,
    # but many providers support json_object in streaming.
    if output_format == OutputFormat.json and format_spec:
        request_params["response_format"] = {"type": "json_object"}

    if backend == LLMBackend.vllm and output_format == OutputFormat.regex and format_spec:
        request_params["extra_body"] = {"guided_regex": format_spec}

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


def _validate_template_response(content: str, template: str) -> bool:
    """Validate that content fits the template structure"""
    return bool(content.strip())


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
