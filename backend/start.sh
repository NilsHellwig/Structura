#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Run migrations
echo "Running database migrations..."
# We check if there's a database already. If not, we or alembic will create it.
alembic upgrade head || echo "Migration failed, but continuing..."

# Start the application
echo "Starting Structura Backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
