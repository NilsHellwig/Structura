# Structura

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" width="60" height="60" alt="Structura Logo" />
</p>

**Structura** is a professional web interface designed for **guaranteed structured outputs** from Large Language Models. It enables developers to bridge the gap between stochastic LLM responses and deterministic application logic through rigorous schema enforcement, regex constraints, and template-based generation.

## 🚀 Key Features

- **Structured Output Modes**: 
  - **JSON Schema**: Native JSON mode with GUI-based schema construction.
  - **Regex Engine**: Force models to strictly follow regular expression patterns.
  - **Templates**: "Fill-in-the-gap" generation using `[GEN]` placeholders.
- **Multi-Backend support**: Connect to **Ollama**, **vLLM**, or **OpenAI** with a single toggle.
- **Artifact Management**: Save, rename, and reuse schemas and patterns across different conversations.
- **Real-time Streaming**: Low-latency token streaming for all backends.
- **Dark Mode First**: A beautifully crafted, high-performance UI tailored for developers.

## 🛠️ Getting Started

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- OR **Python 3.10+** & **Node.js 18+**
- (Optional) **Ollama** or **vLLM** for local inference.

### Installation (Docker - Quick Start)

The easiest way to run Structura is using Docker:

```bash
git clone https://github.com/NilsHellwig/structura.git
cd structura
docker-compose up --build
```

Access the UI at [http://localhost:3000](http://localhost:3000).

### Installation (Manual)

1. **Clone the repository**:
```bash
git clone https://github.com/NilsHellwig/structura.git
cd structura
```

2. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

3. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

## 📖 Documentation

Detailed documentation is available in the [Documentation section](frontend/src/docs/intro.md) including:
- [Concepts & Architecture](frontend/src/docs/concepts.md)
- [Local LLM Setup (Ollama/vLLM)](frontend/src/docs/ollama.md)
- [JSON Schema Guide](frontend/src/docs/json.md)
- [Regex Constrained Generation](frontend/src/docs/regex.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built for the future of structured AI.</p>
