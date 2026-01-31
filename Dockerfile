# Stage 1: Build the React application
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Create Python wheels
FROM python:3.12-slim AS build-backend
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt

# Stage 3: Final runtime image
FROM python:3.12-slim
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install only the necessary runtime packages (no build tools)
COPY --from=build-backend /app/wheels /app/wheels
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir /app/wheels/* \
    && rm -rf /app/wheels

# Copy backend source
COPY backend/ .

# Copy frontend build from stage 1 to the backend's static directory
COPY --from=build-frontend /app/frontend/dist ./static

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Make start script executable
RUN chmod +x ./start.sh

# Command to run the application
CMD ["./start.sh"]
