# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from database import save_prediction, get_history, delete_predictions, check_duplicate, get_analytics, get_unique_fruits
from model import predict_image, get_class_names
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Fruit Classification API")

# Cho phép frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    update_if_duplicate: bool = Query(False, description="Update existing record if duplicate found")
):
    """Predict fruit from image. Checks for duplicates before saving.
    
    Args:
        file: Image file to predict
        update_if_duplicate: If True, update existing record if duplicate found
    """
    # Nhận file ảnh
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    # Gọi model
    result = predict_image(image_bytes)

    # Check for duplicate
    duplicate_info = check_duplicate(image_bytes)
    is_duplicate = duplicate_info is not None

    # Lưu vào DB
    prediction_id = None
    is_new_record = True
    try:
        prediction_id, is_new_record = save_prediction(
            file.filename,
            image_bytes,
            result["label"],
            float(result["confidence"]),
            result.get("tag"),
            extra={"content_type": file.content_type},
            update_existing=update_if_duplicate and is_duplicate,
        )
    except Exception as e:
        print(f"Error saving prediction: {e}")
        # Không chặn phản hồi nếu DB lỗi

    response = {
        "filename": file.filename,
        "result": result,
        "is_duplicate": is_duplicate,
        "is_new_record": is_new_record,
    }
    
    if is_duplicate:
        response["duplicate_info"] = duplicate_info
        if not update_if_duplicate:
            response["message"] = "This image was already uploaded before. A new record was created."
        else:
            response["message"] = "This image was already uploaded. Existing record was updated."
    else:
        response["message"] = "New prediction saved successfully."

    return response

@app.post("/batch-predict")
async def batch_predict(
    files: List[UploadFile] = File(...),
    update_if_duplicate: bool = Query(False, description="Update existing records if duplicates found")
):
    """Process multiple images in batch and save all predictions to MongoDB.
    Checks for duplicates before saving.
    """
    results = []
    
    for file in files:
        try:
            # Đọc file ảnh
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            
            # Gọi model để predict
            result = predict_image(image_bytes)
            
            # Check for duplicate
            duplicate_info = check_duplicate(image_bytes)
            is_duplicate = duplicate_info is not None
            
            # Lưu vào DB
            is_new_record = True
            try:
                _, is_new_record = save_prediction(
                    file.filename or f"batch_{file.filename}",
                    image_bytes,
                    result["label"],
                    float(result["confidence"]),
                    result.get("tag"),
                    extra={"content_type": file.content_type},
                    update_existing=update_if_duplicate and is_duplicate,
                )
            except Exception as e:
                print(f"Error saving prediction for {file.filename}: {e}")
                # Tiếp tục xử lý các file khác dù có lỗi
            
            results.append({
                "filename": file.filename,
                "result": result,
                "is_duplicate": is_duplicate,
                "is_new_record": is_new_record,
                "duplicate_info": duplicate_info if is_duplicate else None,
            })
        except Exception as e:
            print(f"Error processing {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    duplicate_count = len([r for r in results if r.get("is_duplicate", False)])
    new_count = len([r for r in results if r.get("is_new_record", False)])
    
    return {
        "results": results,
        "total": len(results),
        "success": len([r for r in results if "result" in r]),
        "duplicates": duplicate_count,
        "new_records": new_count,
    }

@app.get("/history")
def history():
    data = get_history()
    return {"history": data}


class DeletePredictionsRequest(BaseModel):
    ids: List[str]


@app.delete("/history")
async def delete_history(request: DeletePredictionsRequest):
    """Delete predictions by their IDs from MongoDB."""
    try:
        deleted_count = delete_predictions(request.ids)
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Deleted {deleted_count} prediction(s)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting predictions: {str(e)}")


@app.get("/analytics")
def analytics():
    """Get analytics data for dashboard."""
    try:
        data = get_analytics()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics: {str(e)}")


@app.get("/fruits")
def get_fruits():
    """Get list of unique fruits from database."""
    try:
        fruits = get_unique_fruits()
        return {"fruits": fruits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting fruits: {str(e)}")


@app.get("/labels")
def get_labels():
    """Get list of supported fruit labels from model (from labels.txt file)."""
    try:
        labels = get_class_names()
        if labels is None:
            return {"labels": []}
        return {"labels": labels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting labels: {str(e)}")
