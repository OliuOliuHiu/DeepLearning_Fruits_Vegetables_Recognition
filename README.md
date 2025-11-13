# 🧑‍🤝‍🧑 DLBA Fruit & Veggie Classifier

FastAPI + React app that classifies images into fruit or vegetable, stores predictions in MongoDB, and shows them in a dashboard.

---

## 🙋 Overview

- **Backend**: FastAPI + TensorFlow model loader (supports fruit/vegetable tagging, history, analytics).
- **Frontend**: React + Vite UI for single/batch uploads, history, and analytics.
- **Database**: MongoDB (local container by default).
- **Docker-first workflow**: everything starts with `docker compose up`.

---

## 🧑‍🔧 Prerequisites

- Docker Engine 24+ and Docker Compose v2
- Git
- TensorFlow `.h5` model (not stored in the repo)
- Optional: accompanying `.labels.txt` file for friendly class names

---

## 🧑‍🍳 Prepare the model assets

1. Place your trained model inside `model/` (same folder as `docker-compose.yml`):
   ```
   model/
     └── fruit_classifier_mobilenetv2.h5
   ```
2. (Optional but recommended) add a label file so predictions display real names:
   ```
   model/
     ├── fruit_classifier_mobilenetv2.h5
     └── fruit_classifier_mobilenetv2.labels.txt  # one label per line, in model order
   ```
3. The repo keeps `model/.gitkeep` so the folder exists even without weights.

> **Need to download the model automatically?**  
> Provide a `MODEL_URL` when deploying and run `python back-end/scripts/download_model.py` during build.

---

## 🚀 Run everything with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/OliuOliuHiu/DeepLearning_Fruits_Vegetables_Recognition.git
cd dlba

# 2. Ensure model files are present in ./model (see section above)

# 3. Build and start all services
docker compose up --build
```

What you get:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React UI for uploads/history |
| Backend  | http://localhost:8000 | FastAPI endpoints (`/health`, `/predict`, `/history`, …) |
| Mongo Express | http://localhost:8081 | Quick web UI to inspect MongoDB |
| MongoDB | localhost:27017 | Data store with predictions |

Stop everything:

```bash
docker compose down
```

Tail logs in real-time:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🔁 Common Docker workflows

- **Rebuild after code changes**  
  ```bash
  docker compose down
  docker compose build --no-cache backend frontend
  docker compose up -d
  ```
- **Restart only the backend**  
  ```bash
  docker compose up -d --build backend
  ```
- **Restart only the frontend**  
  ```bash
  docker compose up -d --build frontend
  ```

More tips live in [`REBUILD_DOCKER.md`](REBUILD_DOCKER.md).

---

## 🧱 Project structure

```
dlba/
├── back-end/
│   ├── main.py                 # FastAPI routes
│   ├── model.py                # Model loading + inference helpers
│   ├── database.py             # MongoDB utilities
│   ├── requirements.txt
│   └── scripts/
│       └── download_model.py   # Optional helper to fetch model weights
│
├── front-end/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── config.ts           # Reads API base URL from env
│   │   ├── components/         # UI building blocks
│   │   └── pages/              # Predict, Batch upload, History, Dashboard…
│   ├── package.json
│   └── Dockerfile
│
├── model/
│   ├── .gitkeep                # placeholder – add your .h5 + .labels.txt here
│   └── (your_model_files)
│
├── docker-compose.yml
├── fruit_vegetable_recognition_train_model.ipynb
├── link_dataset_model.txt      # link model h5 and data used for train test model
├── README.md
└── REBUILD_DOCKER.md
```

---

## 📡 API quick reference

- `GET /health` → basic status check
- `POST /predict` → single image prediction
- `POST /batch-predict` → batch upload prediction
- `GET /history` / `DELETE /history` → manage stored predictions
- `GET /analytics` → dashboard stats
- `GET /labels` → available labels from model/label file

---

## 🆘 Need help?

- `docker compose logs -f backend` for API issues  
- `docker compose logs -f frontend` or browser dev tools for UI issues  
- Confirm model files exist in `./model` and MongoDB is running (health checks should succeed)  
- If you plan to deploy (e.g., Render), add `MODEL_URL` and call the download script during build

Happy building! 🧑‍💻🍎🥕
