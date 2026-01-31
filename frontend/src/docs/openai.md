# OpenAI API Integration

Structura integrates seamlessly with OpenAI's state-of-the-art models, providing the most reliable structured output experience through native **Structured Outputs**.

## Configuration

To use OpenAI models, you must provide a valid API key:
1. Navigate to the **Settings** cog in the Chat Header.
2. Select the **OpenAI** backend.
3. Paste your [API Key](https://platform.openai.com/api-keys).

## Supported Models

Structura is optimized for models that support the `json_schema` response format:
- `gpt-4o` (highly recommended)
- `gpt-4o-mini` (cost-effective)
- `o1` and `o1-preview` (for complex logic)

## Native Structured Outputs

When using OpenAI with the **JSON Schema** mode, Structura utilizes the `json_schema` response format with `strict: true`. This guarantees:
- **100% Schema Compliance**: The model will never hallucinate keys or types that aren't in your schema.
- **Deterministic Formatting**: No more "Here is the JSON you requested..." conversational filler.

## Limitations

- **Regex & Templates**: Since OpenAI does not natively support constrained sampling via regex, Structura implements these modes using **system-level prompting**. While highly effective, they do not offer the 100% token-level guarantee that JSON mode provides.
