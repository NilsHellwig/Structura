# Contributing to Structura

First off, thank you for considering contributing to Structura! It's people like you that make Structura such a great tool.

## How Can I Contribute?

### Reporting Bugs
* Check the existing issues to see if the bug has already been reported.
* If not, open a new issue using the **Bug report** template.
* Include as many details as possible: your OS, the LLM backend (Ollama, vLLM, OpenAI), and the specific model you were using.

### Suggesting Enhancements
* Open a new issue using the **Feature request** template.
* Explain the use case and why this feature would be useful for the community.

### Pull Requests
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Ensure your code follows the existing style.
5. Commit your changes (`git commit -m 'feat: add amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.

## Development Environment Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
