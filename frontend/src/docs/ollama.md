# Ollama Integration

Structura is optimized for [Ollama](https://ollama.ai/), enabling true structured generation without relying on "prompt-only" constraints.

### Native API Usage
Unlike generic OpenAI-compatible wrappers, Structura communicates directly with Ollama's `/api/chat` endpoint. This allows us to use the `format` parameter effectively.

### JSON Schema Support
When you select the JSON format, Structura sends your schema directly to Ollama. The model is then constrained to output only tokens that validate against that schema.

### Regex & Templates
For non-JSON formats like Regex or Templates, Structura converts your requirements into a JSON Schema pattern:
```json
{
  "type": "string",
  "pattern": "^YourPattern.*$"
}
```
This ensures that Ollama's internal sampler adheres to your format with nearly 100% reliability.
