# JSON Schemas

JSON (JavaScript Object Notation) is the industry standard for data exchange. Structura allows you to define a JSON Schema that the LLM must follow.

## How it works
When you select a JSON Schema format, Structura sends the schema to the backend. 
- If using **Ollama Native**, the model uses constrained sampling to only pick tokens that satisfy the JSON structure.
- If using **OpenAI**, we use their Structured Outputs feature.

## Example Schema
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "hobbies": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["name", "age"]
}
```

This ensures you never get a "Sure, here is your JSON" message followed by markdown; you get *only* the raw JSON.
