# 🔄 Rebuilding Docker After Code Changes

When code lives inside the container image, Docker keeps running the old build until you rebuild. Use the commands below to make sure your latest changes are running.

---

## 🙅‍♂️ Why `docker compose up` is not enough

- Your backend and frontend code are **copied into the image during build**.
- Running `docker compose down` / `up` without rebuilding reuses the **previous image**.
- Rebuild whenever Python/TypeScript code changes.

---

## ✅ Solutions

### 1. Rebuild everything (recommended)
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 2. Rebuild only backend & frontend
```bash
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d
```

### 3. One-liner rebuild
```bash
docker compose down
docker compose up --build -d
```

---

## 🔍 Verify the new code is live

### Backend
```bash
docker compose logs backend | head -20
# or jump into the container
docker exec -it dlba-backend ls /app
```

### Frontend
```bash
docker compose logs frontend | head -20
# or inspect the source files
docker exec -it dlba-frontend ls /app/src/pages
```

---

## 📝 Important notes

1. **Model folder is mounted** → changes inside `./model` go straight into the container. Just restart the backend:
   ```bash
   docker compose restart backend
   ```
2. **Code changes require rebuilds** → backend or frontend edits need:
   ```bash
   docker compose build --no-cache backend frontend
   docker compose up -d
   ```
3. **Cache** → use `--no-cache` to avoid Docker reusing stale layers.

---

## 🚀 Suggested workflow
```bash
# edit code in back-end/ or front-end/
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d
docker compose logs -f backend
docker compose logs -f frontend
```

---

## ⚡ Handy shortcuts
```bash
# Rebuild everything and restart
docker compose down && docker compose build --no-cache && docker compose up -d

# Only backend
docker compose build --no-cache backend && docker compose up -d backend

# Only frontend
docker compose build --no-cache frontend && docker compose up -d frontend
```

Happy shipping! 🧑‍💻
