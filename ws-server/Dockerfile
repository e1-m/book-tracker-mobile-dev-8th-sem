FROM python:3.13-slim-bookworm
LABEL authors="e1_m"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    build-essential \
    g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN curl -fsSL https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

COPY pyproject.toml ./
RUN uv sync --no-dev

COPY src src

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]