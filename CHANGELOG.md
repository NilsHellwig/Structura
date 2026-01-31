# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-31
### Added
- Professionalized **LLM Parameter Modal** with advanced settings.
- Support for multiple LLM backends: **OpenRouter**, **vLLM**, and **Ollama**.
- **Dark Mode** optimization for better readability in high-contrast environments.

### Fixed
- Fixed 307 Redirect issues for local Ollama instances by normalizing API routes.
- Resolved streaming buffer issues where structured outputs were occasionally truncated.
- Standardized UI components to use a consistent "English-only" interface.

### Removed
- Removed experimental Multi-Modal file upload feature to focus on core structured text generation.

## [1.0.0] - 2026-01-15
### Added
- Initial release of **Structura**.
- Support for **JSON Schema**, **Regex**, and **Template-based** structured outputs.
- Real-time streaming for all supported backends.
- Persistent conversation history with SQLite.
- Interactive JSON-GUI for schema building.

---
*Based on Semantic Versioning.*
