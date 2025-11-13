from __future__ import annotations

from typing import Dict, Optional
import io
import numpy as np
from pathlib import Path

from PIL import Image, ImageOps
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess

# Global variable to store the loaded model
_model: Optional[keras.Model] = None
_class_names: Optional[list] = None
_model_type: Optional[str] = None  # 'efficientnet', 'mobilenet', or 'generic'
_VEGETABLE_LABELS = {
	"beetroot",
	"bell pepper",
	"cabbage",
	"capsicum",
	"carrot",
	"cauliflower",
	"chilli pepper",
	"corn",
	"cucumber",
	"eggplant",
	"garlic",
	"ginger",
	"jalepeno",
	"lettuce",
	"onion",
	"paprika",
	"peas",
	"potato",
	"raddish",
	"soy beans",
	"spinach",
	"sweetcorn",
	"sweetpotato",
	"tomato",
	"turnip",
}


def _determine_tag(label: str) -> str:
	"""Return coarse tag (fruit/vegetable) for a given label."""
	normalized = label.strip().lower()
	if not normalized:
		return "unknown"
	if normalized in _VEGETABLE_LABELS:
		return "vegetable"
	if normalized.startswith("class_"):
		return "unknown"
	return "fruit"


def _find_model_file() -> Path:
	"""Find the model .h5 file in the model directory."""
	current_dir = Path(__file__).parent
	model_dir = current_dir.parent / "model"
	
	if not model_dir.exists():
		raise FileNotFoundError(f"Model directory not found at {model_dir}")
	
	# Tìm file .h5 đầu tiên trong folder model
	h5_files = list(model_dir.glob("*.h5"))
	if not h5_files:
		raise FileNotFoundError(
			f"No .h5 model file found in {model_dir}. "
			"Please place your model file (.h5) in the model/ directory."
		)
	
	if len(h5_files) > 1:
		print(f"Warning: Multiple .h5 files found. Using: {h5_files[0].name}")
	
	return h5_files[0]


def _detect_model_type(model_path: Path, model: keras.Model) -> str:
	"""Detect model type from filename or architecture."""
	filename_lower = model_path.name.lower()
	
	if "efficientnet" in filename_lower:
		return "efficientnet"
	elif "mobilenet" in filename_lower:
		return "mobilenet"
	
	# Try to detect from model architecture
	if hasattr(model, 'layers'):
		for layer in model.layers:
			layer_name = layer.name.lower()
			if "efficientnet" in layer_name:
				return "efficientnet"
			elif "mobilenet" in layer_name:
				return "mobilenet"
	
	return "generic"


def _load_model():
	"""Load the Keras model from h5 file. This is called once when module is imported."""
	global _model, _class_names, _model_type
	
	if _model is not None:
		return  # Model already loaded
	
	# Find model file
	model_path = _find_model_file()
	
	print(f"Loading model from {model_path}...")
	try:
		# Load the model
		_model = keras.models.load_model(str(model_path))
		
		# Detect model type
		_model_type = _detect_model_type(model_path, _model)
		
		print(f"Model loaded successfully!")
		print(f"Model type detected: {_model_type}")
		print(f"Model input shape: {_model.input_shape}")
		print(f"Model output shape: {_model.output_shape}")
		
		# Try to get class names from model if available
		# Some models store class names in metadata
		if hasattr(_model, 'class_names'):
			_class_names = _model.class_names
		elif hasattr(_model, 'config') and 'class_names' in _model.config:
			_class_names = _model.config['class_names']
		else:
			# Try to load from labels file next to the model
			labels_path_txt = model_path.with_suffix(".labels.txt")
			labels_path = model_path.with_suffix(".labels")
			labels_file = labels_path_txt if labels_path_txt.exists() else labels_path if labels_path.exists() else None
			if labels_file:
				print(f"Loading labels from {labels_file}...")
				with open(labels_file, "r", encoding="utf-8") as f:
					_class_names = [line.strip() for line in f if line.strip()]
				print(f"Loaded {len(_class_names)} labels from file")
				if len(_class_names) > 0:
					print(f"   First few labels: {_class_names[:5]}")
			else:
				print(f" No labels file found. Looking for: {labels_path_txt} or {labels_path}")
				# If class names not found, we'll use indices
				num_classes = _model.output_shape[-1] if _model.output_shape else None
				if num_classes:
					_class_names = [f"Class_{i}" for i in range(num_classes)]
					print(f"   Using default class names: Class_0 to Class_{num_classes-1}")
				else:
					_class_names = None
		
		print(f"Number of classes: {len(_class_names) if _class_names else 'Unknown'}")
		
	except Exception as e:
		raise RuntimeError(f"Failed to load model: {str(e)}")


def _preprocess_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
	"""Preprocess image for model inference.
	
	Args:
		image_bytes: Raw image bytes
		target_size: Target size (width, height) for resizing
		
	Returns:
		Preprocessed image array ready for model input
	"""
	# Open and convert image
	image = Image.open(io.BytesIO(image_bytes))
	
	# Honor EXIF orientation (prevents sideways/upside-down inputs)
	image = ImageOps.exif_transpose(image)
	
	# Convert to RGB if necessary (handles RGBA, L, etc.)
	if image.mode != 'RGB':
		image = image.convert('RGB')
	
	# Resize image to target size
	image = image.resize(target_size, Image.Resampling.LANCZOS)
	
	# Convert to numpy array
	img_array = np.array(image, dtype=np.float32)
	
	# Apply model-specific preprocessing
	global _model_type
	if _model_type == "efficientnet":
		# EfficientNet preprocessing (scales to [-1, 1] with normalization)
		img_array = efficientnet_preprocess(img_array)
	elif _model_type == "mobilenet":
		# MobileNetV2 preprocessing (scales to [-1, 1] with normalization)
		img_array = mobilenet_preprocess(img_array)
	else:
		# Generic preprocessing: normalize to [0, 1]
		img_array = img_array / 255.0
	
	# Add batch dimension: (height, width, channels) -> (1, height, width, channels)
	img_array = np.expand_dims(img_array, axis=0)
	
	return img_array


def predict_image(image_bytes: bytes) -> Dict[str, float | str]:
	"""Predict fruit class from image using the loaded Keras model.
	
	Args:
		image_bytes: Raw image bytes
		
	Returns:
		Dict with 'label' (str) and 'confidence' (float) keys
	"""
	global _model, _class_names
	
	# Load model if not already loaded
	if _model is None:
		_load_model()
	
	if _model is None:
		raise RuntimeError("Model failed to load. Cannot make predictions.")
	
	try:
		# Get target size from model input shape
		# Model input shape is usually (None, height, width, channels)
		if _model.input_shape and len(_model.input_shape) >= 3:
			target_size = (_model.input_shape[2], _model.input_shape[1])  # (width, height)
		else:
			target_size = (224, 224)  # Default size
		
		# Preprocess image
		preprocessed_image = _preprocess_image(image_bytes, target_size)
		
		# Make prediction
		predictions = _model.predict(preprocessed_image, verbose=0)
		
		# If model outputs logits (no softmax), convert to probabilities
		if predictions.ndim == 2 and predictions.shape[0] == 1:
			row = predictions[0]
			row_sum = float(np.sum(row))
			# Heuristic: if sum is not approximately 1, apply softmax
			if not (0.99 <= row_sum <= 1.01):
				row = tf.nn.softmax(row).numpy()
				predictions = np.expand_dims(row, axis=0)
		
		# Get the predicted class index and confidence
		predicted_index = np.argmax(predictions[0])
		confidence = float(predictions[0][predicted_index])
		
		# Get class name
		if _class_names and predicted_index < len(_class_names):
			label = _class_names[predicted_index]
		else:
			label = f"Class_{predicted_index}"
		
		return {
			"label": label,
			"confidence": round(confidence, 4),
			"tag": _determine_tag(label),
		}
		
	except Exception as e:
		raise RuntimeError(f"Error during prediction: {str(e)}")


def get_class_names() -> Optional[list]:
	"""Get the list of class names from the loaded model.
	
	Returns:
		List of class names, or None if model not loaded
	"""
	global _model, _class_names
	
	# Ensure model is loaded
	if _model is None:
		_load_model()
	
	return _class_names


# Load model when module is imported
try:
	_load_model()
except Exception as e:
	print(f"Warning: Could not load model at startup: {e}")
	print("Model will be loaded on first prediction call.")
