# Templates

Templates are Structura's most flexible output format. They allow you to define a document structure while letting the LLM fill in the gaps.

## The Syntax
Templates use a simple `[GEN]` tag to mark where the LLM should generate content.

### Example:
```text
TITLE: [GEN]
DATE: [GEN]

SUMMARY:
[GEN]

KEY TAKEAWAYS:
- [GEN]
- [GEN]
```

## How Structura Handles Templates
When a template is used, Structura:
1. Translates the template into a complex Regex pattern.
2. Sends the pattern to the backend (like Ollama).
3. The LLM then generates text that fits *exactly* into those slots, preserving all your static text (like "TITLE:", "SUMMARY:", etc.).
