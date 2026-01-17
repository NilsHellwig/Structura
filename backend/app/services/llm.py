from typing import List, Dict, Any
from app.schemas.message import OutputFormat, LLMBackend
import httpx
import os
import json
import re


async def generate_llm_response(
    backend: LLMBackend,
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response from LLM based on backend and format"""
    
    if backend == LLMBackend.openai:
        return await _generate_openai_response(model, messages, output_format, format_spec, parameters)
    elif backend == LLMBackend.vllm:
        return await _generate_vllm_response(model, messages, output_format, format_spec, parameters)
    elif backend == LLMBackend.ollama:
        return await _generate_ollama_response(model, messages, output_format, format_spec, parameters)
    else:
        raise ValueError(f"Unknown backend: {backend}")


async def _generate_openai_response(
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response using OpenAI API"""
    from openai import AsyncOpenAI
    
    api_key = parameters.get("api_key") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key not provided")
    
    client = AsyncOpenAI(api_key=api_key)
    
    # Prepare request parameters
    request_params = {
        "model": model,
        "messages": messages,
        "temperature": parameters.get("temperature", 0.7),
        "max_tokens": parameters.get("max_tokens", 2048),
    }
    
    # Handle structured output
    if output_format == OutputFormat.json and format_spec:
        try:
            schema = json.loads(format_spec)
            request_params["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "schema": schema,
                    "strict": True
                }
            }
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON schema")
    
    # Make API call
    response = await client.chat.completions.create(**request_params)
    content = response.choices[0].message.content
    
    # Validate format if needed
    if output_format == OutputFormat.regex and format_spec:
        if not _validate_regex_response(content, format_spec):
            raise ValueError("Response does not match regex pattern")
    elif output_format == OutputFormat.template and format_spec:
        if not _validate_template_response(content, format_spec):
            raise ValueError("Response does not match template")
    
    return content


async def _generate_vllm_response(
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response using vLLM API"""
    base_url = parameters.get("base_url", "http://localhost:8000")
    
    # Prepare request
    request_data = {
        "model": model,
        "messages": messages,
        "temperature": parameters.get("temperature", 0.7),
        "max_tokens": parameters.get("max_tokens", 2048),
    }
    
    # Add guided decoding for structured output
    if output_format == OutputFormat.json and format_spec:
        request_data["guided_json"] = format_spec
    elif output_format == OutputFormat.regex and format_spec:
        request_data["guided_regex"] = format_spec
    
    # Make API call
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/v1/chat/completions",
            json=request_data,
            timeout=120.0
        )
        response.raise_for_status()
        data = response.json()
    
    content = data["choices"][0]["message"]["content"]
    
    # Validate template if needed
    if output_format == OutputFormat.template and format_spec:
        if not _validate_template_response(content, format_spec):
            raise ValueError("Response does not match template")
    
    return content


async def _generate_ollama_response(
    model: str,
    messages: List[Dict[str, str]],
    output_format: OutputFormat,
    format_spec: str | None,
    parameters: Dict[str, Any]
) -> str:
    """Generate response using Ollama API"""
    base_url = parameters.get("base_url", "http://localhost:11434")
    
    # Prepare request
    request_data = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": parameters.get("temperature", 0.7),
            "num_predict": parameters.get("max_tokens", 2048),
        }
    }
    
    # Add format for structured output
    if output_format == OutputFormat.json and format_spec:
        request_data["format"] = "json"
    
    # Make API call
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/api/chat",
            json=request_data,
            timeout=120.0
        )
        response.raise_for_status()
        data = response.json()
    
    content = data["message"]["content"]
    
    # Validate format if needed
    if output_format == OutputFormat.regex and format_spec:
        if not _validate_regex_response(content, format_spec):
            raise ValueError("Response does not match regex pattern")
    elif output_format == OutputFormat.template and format_spec:
        if not _validate_template_response(content, format_spec):
            raise ValueError("Response does not match template")
    
    return content


def _validate_regex_response(content: str, pattern: str) -> bool:
    """Validate that content matches regex pattern"""
    try:
        return bool(re.fullmatch(pattern, content))
    except re.error:
        return False


def _validate_template_response(content: str, template: str) -> bool:
    """Validate that content fits the template structure"""
    # For now, just check that content is not empty
    # More sophisticated validation could be added
    return bool(content.strip())


async def get_available_models(backend: LLMBackend, parameters: Dict[str, Any]) -> List[str]:
    """Get available models for a backend"""
    
    if backend == LLMBackend.openai:
        return await _get_openai_models(parameters)
    elif backend == LLMBackend.vllm:
        return await _get_vllm_models(parameters)
    elif backend == LLMBackend.ollama:
        return await _get_ollama_models(parameters)
    else:
        raise ValueError(f"Unknown backend: {backend}")


async def _get_openai_models(parameters: Dict[str, Any]) -> List[str]:
    """Get available OpenAI models"""
    from openai import AsyncOpenAI
    
    api_key = parameters.get("api_key") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key not provided")
    
    client = AsyncOpenAI(api_key=api_key)
    models = await client.models.list()
    
    # Filter to chat models
    chat_models = [m.id for m in models.data if "gpt" in m.id.lower()]
    return sorted(chat_models)


async def _get_vllm_models(parameters: Dict[str, Any]) -> List[str]:
    """Get available vLLM models"""
    base_url = parameters.get("base_url", "http://localhost:8000")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/v1/models")
        response.raise_for_status()
        data = response.json()
    
    return [model["id"] for model in data.get("data", [])]


async def _get_ollama_models(parameters: Dict[str, Any]) -> List[str]:
    """Get available Ollama models"""
    base_url = parameters.get("base_url", "http://localhost:11434")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/api/tags")
        response.raise_for_status()
        data = response.json()
    
    return [model["name"] for model in data.get("models", [])]
