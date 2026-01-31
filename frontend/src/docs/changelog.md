# Version History

Keep track of the evolution of Structura.

## [1.1.0] - 2026-01-31
### Added
- **Docker Hub Readiness**: The entire application (Frontend & Backend) is now available as a single unified Docker container.
- **Enhanced Documentation**: Complete architectural, implementation, and format guides.
- **Unified Nginx Proxy**: Seamless routing for production deployments.

### Improved
- **Build Optimization**: Smaller bundle sizes and faster build times using Vite and Rolldown.
- **UI Polish**: Refined "Developer-First" aesthetics with Phosphor Icons and Framer Motion.

### Fixed
- Streaming buffer normalization for mixed-format LLM chunks.
- CORS resolution for local vLLM/Ollama setups.

## [1.0.0] - 2026-01-15
### Released
- Initial launch of **Structura**.
- Core engine for **JSON Schema**, **Regex**, and **Templates**.
- Multi-backend support (Ollama, vLLM, OpenAI).
- Real-time streaming and persistent history.
