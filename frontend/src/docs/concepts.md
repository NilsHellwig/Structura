# Core Concepts

Structura is designed to bridge the gap between human intent and machine-readable data.

## Structured Generation
The core concept of Structura is **Guided Generation**. Instead of relying on the LLM to "hopefully" produce the right format, we use grammar constraints (Regex, JSON Schema) to force the model to follow specific rules.

## Artifacts
In Structura, an "Artifact" is a reusable definition of an output format.
- **JSON Schemas**: Perfect for data extraction and API inputs.
- **Regex Patterns**: Great for small, strictly formatted strings (IDs, codes).
- **Templates**: Allow for complex, human-readable documents with structured placeholders.

## Workflow
1. **Choose a Backend**: Connect to Ollama, vLLM, or OpenAI.
2. **Select or Create a Format**: Define what the model's response should look like.
3. **Chat**: Talk to the model normally; it will automatically adhere to your chosen format.
