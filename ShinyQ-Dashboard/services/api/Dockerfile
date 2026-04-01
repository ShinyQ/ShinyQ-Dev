FROM python:3.11-slim

# Add uv directly from the official container
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy lockfiles and install dependencies directly
# This caches the dependency installation step as long as lockfile isn't changed
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project --no-dev

# Copy the rest of the application code
COPY . .

# Sync the project itself
RUN uv sync --locked --no-dev

# Expose the fastAPI default port for compose
EXPOSE 8000

# The standard command pointing to the virtualenv installed uvicorn
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
