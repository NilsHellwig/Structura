# Ollama Integration

Structura is highly optimized for [Ollama](https://ollama.ai/), the easiest way to run LLMs locally.

## Why use Ollama with Structura?

Ollama provides a simple REST API that Structura leverages for:
- **Native Constrained Sampling**: Using GBNF grammars to ensure valid JSON and text patterns.
- **Ease of Use**: No complex GPU configurations needed; just download and run.

## Configuration

- **Endpoint**: By default, Ollama runs on `http://localhost:11434`.
- **Native Support**: Structura uses the Ollama native `/api/chat` interface to leverage advanced sampling and model-specific features.
- **Auto-Discovery**: When you select the Ollama backend, Structura automatically queries your local instance for available models (e.g., `llama3.1`, `mistral`, `deepseek-r1`).

## Troubleshooting

1. **CORS Issues**: If Structura cannot connect, set `OLLAMA_ORIGINS="*"` in your environment variables before starting the Ollama service.
2. **Model Availability**: Ensure you have pulled the models you want to use (`ollama pull llama3.1`).
