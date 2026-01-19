# Installation

Follow these steps to set up Structura on your local machine.

### Prerequisites
- **Node.js**: Version 18 or higher.
- **Python**: Version 3.10 or higher (for the backend).
- **Ollama**: (Optional) For local model support.

### 1. Clone the Repository
```bash
git clone https://github.com/nils-hellwig/structura.git
cd structura
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
