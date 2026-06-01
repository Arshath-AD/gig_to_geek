# ============================================================
# GigToGeek — Backend Dockerfile
# Base: python:3.11-slim  |  Multi-stage build
# ============================================================

# ── Stage 1: Dependency Builder ──────────────────────────────
FROM python:3.11-slim AS builder

# Prevent .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Install OS-level build deps (needed for psycopg2-binary, bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies into an isolated prefix
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: Runtime Image ───────────────────────────────────
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

WORKDIR /app

# Install only the runtime OS libs required by psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Pull installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Expose the Uvicorn port
EXPOSE 8000

# Default production entrypoint (Docker Compose overrides this for dev)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
