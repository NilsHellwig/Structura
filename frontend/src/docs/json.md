# JSON Structured Outputs

The JSON format is the primary method for extracting programmatic data from LLMs. Structura provides a dual-interface for managing these schemas: a **Visual GUI** and a **Raw Schema Editor**.

## The GUI Editor

Structura includes a proprietary tree-based schema builder. This allows users to:
- Add nested objects and arrays.
- Define string, number, and boolean types.
- Set "Required" flags on specific properties.
- Toggle between a developer-friendly tree and raw JSON.

## Implementation Details

### OpenAI (Structured Outputs)
For OpenAI models (gpt-4o and newer), Structura utilizes the `json_schema` response format with `strict: true`. This guarantees that the output matches your schema with 100% reliability.

### Ollama & vLLM (Constrained Sampling)
Local backends utilize GBNF (GGML BNF) grammars or XGrammar to constrain the model's logits during prediction. Structura automatically converts your JSON Schema into the required backend format, ensuring the model cannot deviate from the defined structure.

## Best Practices

- **Keep it Simple**: Large schemas can consume significant context and "confuse" smaller models.
- **Provide Samples**: If a field is complex, use the prompt to provide an example of the expected value.
- **Use Descriptions**: Even though Structura's GUI focuses on types, adding descriptions to properties in the raw editor helps the model understand intent.
