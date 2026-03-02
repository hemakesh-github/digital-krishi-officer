from io import BytesIO
from PIL import Image
from database import get_session
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from Utils.db_operations import addDiseaseDetection, getDiseaseDetectionHistory, getDiseaseDetectionById
from Utils.cloud_storage import validate_image_filename, upload_image_bytes
from Utils.dependencies import verify_token

router = APIRouter()

# Import from main after it's loaded
def get_disease_predictor():
    from main import get_disease_predictor
    return get_disease_predictor()

@router.post("/detect")
async def detect_disease(
    image: UploadFile = File(...),
    session=Depends(get_session),
    user=Depends(verify_token)
):
    """Detect disease from uploaded crop image"""
    try:
        # Validate image
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload an image"
            )
        
        file_ext = validate_image_filename(image.filename)
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image is empty"
            )

        image_url, object_name = upload_image_bytes(image_bytes, file_ext)
        
        # Get disease predictor
        predictor = get_disease_predictor()
        
        if predictor is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Disease prediction model not available"
            )
        
        # Open and process image
        try:
            img = Image.open(BytesIO(image_bytes))
            if img.mode != 'RGB':
                img = img.convert('RGB')
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not process image: {str(e)}"
            )
        
        # Make prediction
        disease, confidence = predictor.predict(img)
        
        # Save to database
        result = {
            "disease": disease.replace("___", " ").capitalize(),
            "confidence": confidence
        }
        
        saved = addDiseaseDetection(session, user.id, result, image_url)
        
        if not saved:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save detection result"
            )
        return {
            "success": True,
            "disease": disease.replace("___", " ").capitalize(),
            "confidence": f"{confidence}%",
            "image_path": image_url,
            "image_object": object_name,
            "sessionId": saved
        }        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in disease detection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Disease detection failed: {str(e)}"
        )


@router.get("/history")
async def get_history(
    session=Depends(get_session),
    user=Depends(verify_token)
):
    """Get disease detection history for current user"""
    try:
        history = getDiseaseDetectionHistory(session, user.id)
        
        if history is None:
            return {"success": True, "history": []}
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        print(f"Error fetching disease history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch disease detection history"
        )


@router.get("/{sessionId}")
async def get_disease_result(
    sessionId: int,
    session=Depends(get_session),
    user=Depends(verify_token)
):
    """Retrieve details for a specific disease detection session"""
    detection = getDiseaseDetectionById(session, sessionId, user.id)
    if not detection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection session not found"
        )
    return {"success": True, "detection": detection}
