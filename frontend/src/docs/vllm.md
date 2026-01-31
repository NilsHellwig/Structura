# vLLM Setup & Integration

Structura provides first-class support for **vLLM**, the high-throughput serving engine for LLMs.

## Overview

vLLM is an industrial-grade library for LLM inference and serving. It is designed for maximum throughput and low latency, making it the ideal choice for production environments of Structura.

## Configuration

1. **Endpoint**: vLLM typically serves an OpenAI-compatible API on `http://localhost:8000`.
2. **Parameters**:
   - **Base URL**: Set this to your vLLM server address in the Structura Settings.
   - **API Key**: Usually not required for local vLLM instances, but can be provided if running behind a proxy like LiteLLM.

## Structured Outputs in vLLM

Structura leverages vLLM's implementation of **guided decoding**. When you use JSON, Regex, or Templates, Structura translates your requirements into parameters that vLLM understands:

- **JSON Mode**: Uses the `guided_json` parameter.
- **Regex Mode**: Uses the `guided_regex` parameter.
- **Templates**: Are converted to complex regex and passed via `guided_regex`.

## Performance Optimization

For the best experience with vLLM and Structura:
- Use models that support GBNF or XGrammar (most Llama-based models).
- Ensure your vLLM instance has enough GPU memory to handle both the model and the constraint engine's overhead.
- If you encounter "Out of Memory" errors during complex regex generation, consider reducing the `max_model_len` in your vLLM startup command.

## Example Startup
```bash
python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3.1-8B-Instruct
```
