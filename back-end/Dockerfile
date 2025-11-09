FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (Pillow needs these for some formats)
RUN apt-get update && apt-get install -y --no-install-recommends \
	libjpeg62-turbo-dev zlib1g-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default envs; can be overridden by compose
ENV MONGODB_URI=mongodb://mongo:27017 \
	MONGODB_DB=dlba \
	MONGODB_COLLECTION=predictions

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


