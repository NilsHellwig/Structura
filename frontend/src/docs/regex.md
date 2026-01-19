# Regex Patterns

Regular Expressions (Regex) are powerful tools for defining string patterns.

## Use Cases
Regex is ideal when you need the LLM to provide a very specific, small piece of information:
- **Product IDs**: `[A-Z]{3}-\d{4}`
- **Dates**: `\d{4}-\d{2}-\d{2}`
- **Email addresses**: Simplified patterns for extraction.

## Configuration
In the **Artifact Library**, you can test your Regex patterns against sample inputs to ensure they match exactly what you expect before using them in a conversation.
