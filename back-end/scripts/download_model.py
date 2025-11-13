import os
from pathlib import Path
from urllib.parse import urlparse

import requests


def download_model():
    model_url = os.getenv("MODEL_URL")
    if not model_url:
        raise RuntimeError(
            "MODEL_URL environment variable is not set. "
            "Provide a direct download URL for the model file."
        )

    # Determine filename from URL path
    parsed = urlparse(model_url)
    filename = Path(parsed.path).name or "model.h5"

    model_dir = Path(__file__).resolve().parent.parent / "model"
    model_dir.mkdir(parents=True, exist_ok=True)

    destination = model_dir / filename

    print(f"Downloading model from {model_url}")
    response = requests.get(model_url, timeout=60)
    response.raise_for_status()

    destination.write_bytes(response.content)
    print(f"Model saved to {destination}")


if __name__ == "__main__":
    download_model()

