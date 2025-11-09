import base64
import hashlib
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


def _get_mongo_client() -> MongoClient:
	"""Create and return a cached MongoDB client using MONGODB_URI env var."""
	mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
	# Add connection timeout and retry settings
	return MongoClient(
		mongo_uri,
		serverSelectionTimeoutMS=5000,
		connectTimeoutMS=5000,
		socketTimeoutMS=5000,
	)


# Lazy initialization - only connect when needed
_client = None
_db_name = os.getenv("MONGODB_DB", "dlba")
_col_name = os.getenv("MONGODB_COLLECTION", "predictions")


def _ensure_connection():
	"""Ensure MongoDB connection is established with retry logic."""
	global _client
	if _client is None:
		max_retries = 10
		for attempt in range(max_retries):
			try:
				_client = _get_mongo_client()
				# Test connection
				_client.admin.command('ping')
				return _client
			except (ConnectionFailure, ServerSelectionTimeoutError) as e:
				if attempt < max_retries - 1:
					time.sleep(2)
					continue
				raise
	return _client


def _get_collection():
	"""Get collection with connection retry."""
	client = _ensure_connection()
	return client[_db_name][_col_name]


def _calculate_image_hash(image_bytes: bytes) -> str:
	"""Calculate SHA256 hash of image bytes for duplicate detection."""
	return hashlib.sha256(image_bytes).hexdigest()


def check_duplicate(image_bytes: bytes) -> Optional[Dict[str, Any]]:
	"""Check if an image with the same hash already exists in database.
	
	Args:
		image_bytes: Raw image bytes
		
	Returns:
		Dict with existing prediction info if duplicate found, None otherwise
	"""
	try:
		collection = _get_collection()
		image_hash = _calculate_image_hash(image_bytes)
		
		# Find existing prediction with same hash
		existing = collection.find_one({"image_hash": image_hash})
		
		if existing:
			return {
				"id": str(existing.get("_id")),
				"filename": existing.get("filename"),
				"predicted_label": existing.get("predicted_label"),
				"confidence": existing.get("confidence"),
				"created_at": existing.get("created_at").isoformat() if existing.get("created_at") else None,
			}
		return None
	except Exception as e:
		print(f"Error checking duplicate: {e}")
		return None


def save_prediction(
	filename: str,
	image_bytes: bytes,
	label: str,
	confidence: float,
	extra: Dict[str, Any] | None = None,
	update_existing: bool = False,
) -> Tuple[str, bool]:
	"""Persist a prediction record along with input data.

	We store a small base64 version of the input for traceability. For large-scale
	deployments, consider GridFS or object storage.
	
	Args:
		filename: Original filename
		image_bytes: Raw image bytes
		label: Predicted label
		confidence: Prediction confidence
		extra: Additional metadata
		update_existing: If True and duplicate found, update existing record instead of creating new
		
	Returns:
		Tuple of (prediction_id, is_new_record)
	"""
	try:
		collection = _get_collection()
		image_hash = _calculate_image_hash(image_bytes)
		
		# Check for duplicate
		existing = collection.find_one({"image_hash": image_hash})
		
		if existing and update_existing:
			# Update existing record (không lưu lại base64)
			update_doc: Dict[str, Any] = {
				"filename": filename,
				"predicted_label": label,
				"confidence": confidence,
				"updated_at": datetime.now(timezone.utc),
			}
			if extra:
				update_doc.update({"meta": extra})
			
			collection.update_one(
				{"_id": existing["_id"]},
				{"$set": update_doc}
			)
			return (str(existing["_id"]), False)
		
		if existing:
			# Duplicate found but not updating - create new record without base64
			# Reference to original record to save storage
			print(f"[DUPLICATE DETECTED] Image hash {image_hash[:16]}... already exists. Creating record WITHOUT base64.")
			doc: Dict[str, Any] = {
				"filename": filename,
				"predicted_label": label,
				"confidence": confidence,
				"image_hash": image_hash,
				"duplicate_of": str(existing["_id"]),  # Reference to original record
				"created_at": datetime.now(timezone.utc),
			}
			if extra:
				doc.update({"meta": extra})
			# Không lưu image_base64 để tiết kiệm storage
			# Chú ý: KHÔNG có trường "image_base64" trong doc này
			
			result = collection.insert_one(doc)
			print(f"[DUPLICATE SAVED] New record {result.inserted_id} created WITHOUT base64, references {existing['_id']}")
			return (str(result.inserted_id), True)
		
		# New unique image - save with base64
		print(f"[NEW IMAGE] Image hash {image_hash[:16]}... is unique. Saving WITH base64.")
		encoded_image = base64.b64encode(image_bytes).decode("utf-8")
		doc: Dict[str, Any] = {
			"filename": filename,
			"predicted_label": label,
			"confidence": confidence,
			"image_base64": encoded_image,
			"image_hash": image_hash,
			"created_at": datetime.now(timezone.utc),
		}
		if extra:
			doc.update({"meta": extra})

		result = collection.insert_one(doc)
		print(f"[NEW IMAGE SAVED] Record {result.inserted_id} created WITH base64")
		return (str(result.inserted_id), True)
	except Exception as e:
		print(f"Error saving prediction: {e}")
		raise


def get_history(limit: int = 50) -> List[Dict[str, Any]]:
	"""Return the most recent prediction records (including image_base64 for display).
	
	If a record is a duplicate (has duplicate_of), fetch image_base64 from the original record.
	"""
	try:
		from bson import ObjectId
		collection = _get_collection()
		cursor = (
			collection
			.find({})
			.sort("created_at", -1)
			.limit(limit)
		)
		
		result = []
		for doc in cursor:
			image_base64 = doc.get("image_base64")
			duplicate_of = doc.get("duplicate_of")
			
			# Nếu không có image_base64 và có duplicate_of, lấy từ record gốc
			if not image_base64 and duplicate_of:
				try:
					original_id = ObjectId(duplicate_of)
					original_doc = collection.find_one({"_id": original_id})
					if original_doc:
						image_base64 = original_doc.get("image_base64")
				except Exception as e:
					print(f"Error fetching original image for duplicate {doc.get('_id')}: {e}")
			
			result.append({
				"id": str(doc.get("_id")),
				"filename": doc.get("filename"),
				"predicted_label": doc.get("predicted_label"),
				"confidence": doc.get("confidence"),
				"image_base64": image_base64,
				"created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
				"meta": doc.get("meta"),
				"is_duplicate": duplicate_of is not None,
			})
		
		return result
	except Exception as e:
		print(f"Error getting history: {e}")
		return []


def get_analytics() -> Dict[str, Any]:
	"""Get analytics data for dashboard.
	
	Returns:
		Dict with various analytics metrics
	"""
	try:
		from bson import ObjectId
		from datetime import datetime, timedelta, timezone
		collection = _get_collection()
		
		# Total predictions
		total_predictions = collection.count_documents({})
		
		# Unique images (with base64)
		unique_images = collection.count_documents({"image_base64": {"$exists": True, "$ne": None}})
		
		# Duplicate records
		duplicate_count = collection.count_documents({"duplicate_of": {"$exists": True, "$ne": None}})
		
		# Today's predictions
		today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
		today_count = collection.count_documents({"created_at": {"$gte": today_start}})
		
		# This week's predictions
		week_start = today_start - timedelta(days=today_start.weekday())
		week_count = collection.count_documents({"created_at": {"$gte": week_start}})
		
		# This month's predictions
		month_start = today_start.replace(day=1)
		month_count = collection.count_documents({"created_at": {"$gte": month_start}})
		
		# Average confidence
		pipeline = [
			{"$group": {
				"_id": None,
				"avg_confidence": {"$avg": "$confidence"},
				"max_confidence": {"$max": "$confidence"},
				"min_confidence": {"$min": "$confidence"}
			}}
		]
		confidence_stats = list(collection.aggregate(pipeline))
		avg_confidence = confidence_stats[0]["avg_confidence"] if confidence_stats else 0
		max_confidence = confidence_stats[0]["max_confidence"] if confidence_stats else 0
		min_confidence = confidence_stats[0]["min_confidence"] if confidence_stats else 0
		
		# Top predicted labels
		label_pipeline = [
			{"$group": {
				"_id": "$predicted_label",
				"count": {"$sum": 1}
			}},
			{"$sort": {"count": -1}},
			{"$limit": 10}
		]
		top_labels = list(collection.aggregate(label_pipeline))
		
		# Predictions by day (last 7 days)
		seven_days_ago = today_start - timedelta(days=7)
		daily_pipeline = [
			{"$match": {"created_at": {"$gte": seven_days_ago}}},
			{"$group": {
				"_id": {
					"$dateToString": {
						"format": "%Y-%m-%d",
						"date": "$created_at"
					}
				},
				"count": {"$sum": 1}
			}},
			{"$sort": {"_id": 1}}
		]
		daily_stats = list(collection.aggregate(daily_pipeline))
		
		# Predictions by hour (last 24 hours)
		day_ago = datetime.now(timezone.utc) - timedelta(days=1)
		hourly_pipeline = [
			{"$match": {"created_at": {"$gte": day_ago}}},
			{"$group": {
				"_id": {"$hour": "$created_at"},
				"count": {"$sum": 1}
			}},
			{"$sort": {"_id": 1}}
		]
		hourly_stats = list(collection.aggregate(hourly_pipeline))
		
		# Storage estimation (rough calculation)
		# Estimate base64 size: average ~500KB per image
		estimated_storage_mb = (unique_images * 0.5)  # Rough estimate
		saved_storage_mb = (duplicate_count * 0.5)  # Saved by not storing duplicates
		
		return {
			"total_predictions": total_predictions,
			"unique_images": unique_images,
			"duplicate_count": duplicate_count,
			"today_count": today_count,
			"week_count": week_count,
			"month_count": month_count,
			"confidence": {
				"average": round(avg_confidence * 100, 2) if avg_confidence else 0,
				"max": round(max_confidence * 100, 2) if max_confidence else 0,
				"min": round(min_confidence * 100, 2) if min_confidence else 0,
			},
			"top_labels": [
				{"label": item["_id"], "count": item["count"]}
				for item in top_labels
			],
			"daily_stats": [
				{"date": item["_id"], "count": item["count"]}
				for item in daily_stats
			],
			"hourly_stats": [
				{"hour": item["_id"], "count": item["count"]}
				for item in hourly_stats
			],
			"storage": {
				"estimated_mb": round(estimated_storage_mb, 2),
				"saved_mb": round(saved_storage_mb, 2),
			}
		}
	except Exception as e:
		print(f"Error getting analytics: {e}")
		return {}


def delete_predictions(prediction_ids: List[str]) -> int:
	"""Delete predictions by their IDs from MongoDB.
	
	Args:
		prediction_ids: List of prediction IDs (MongoDB ObjectId strings)
		
	Returns:
		Number of deleted documents
	"""
	try:
		from bson import ObjectId
		collection = _get_collection()
		
		# Convert string IDs to ObjectId
		object_ids = []
		for pred_id in prediction_ids:
			try:
				object_ids.append(ObjectId(pred_id))
			except Exception as e:
				print(f"Invalid ObjectId: {pred_id}, error: {e}")
				continue
		
		if not object_ids:
			return 0
		
		# Delete documents
		result = collection.delete_many({"_id": {"$in": object_ids}})
		return result.deleted_count
	except Exception as e:
		print(f"Error deleting predictions: {e}")
		raise