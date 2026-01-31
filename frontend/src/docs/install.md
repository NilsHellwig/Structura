# Installation

Structura is designed to be lightweight and portable. You can run it via Docker (recommended for production-like setups) or manual installation for development.

## Docker Setup (Local Build)

The easiest way to run Structura is to build it locally using the provided configuration.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NilsHellwig/structura.git
   cd structura
   ```

2. **Build and run everything**:
   ```bash
   docker-compose up --build -d
   ```

Alternatively, if you want to use the unified single-container Dockerfile:

1. **Build the image**:
   ```bash
   docker build -t structura .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 -v ./data:/app/data structura
   ```

Access the application at [http://localhost:8000](http://localhost:8000).

## Manual Installation (Development)

The backend is built with FastAPI and uses SQLite for persistence.

1. **Enter directory and initialize virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment setup**: Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. **Launch Backend**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Step 3: Frontend Configuration

The frontend is a Vite-powered React application with TypeScript.

1. **Enter directory**:
   ```bash
   cd ../frontend
   ```

2. **Install modules**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access UI**: Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 4: Connecting Backends

Once the application is running, navigate to the **Settings** (top-right cog) to configure your backend URLs:
- **Ollama Default**: `http://localhost:11434`
- **vLLM Default**: `http://localhost:8000`
- **OpenAI**: Requires a valid `OPENAI_API_KEY`.
