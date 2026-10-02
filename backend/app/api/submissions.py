from fastapi import APIRouter, HTTPException, File, UploadFile
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.database.supabase import supabase
from app.services.scoring import calculate_score
from app.services.screenshot_parser import parse_screenshot
from app.services.validator import validate_submission
from datetime import datetime

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post("/preview")
async def preview_submission(file: UploadFile = File(...)):
    if file.content_type not in ["image/png", "image/jpeg", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG, JPEG, and WEBP are supported.")
        
    contents = await file.read()
    
    # Process screenshot and extract data
    result = parse_screenshot(contents)
    
    # Validate result
    validation = validate_submission(result)
    result["valid"] = validation["valid"]
    if not validation["valid"]:
        result["message"] = f"Validation Warning: {validation['message']}"
        result["confidence"] = validation["confidence"]
        
    # Remove puzzle_number from the preview result as the frontend won't use it
    if "puzzle_number" in result:
        del result["puzzle_number"]
        
    return result

@router.post("", response_model=SubmissionResponse)
def create_submission(submission: SubmissionCreate):
    try:
        score = calculate_score(attempts=submission.attempts, solved=submission.solved)
        
        # Auto-calculate puzzle_number as the number of days since epoch
        current_day = int(datetime.utcnow().timestamp() / 86400)
        
        data = {
            "player_id": submission.player_id,
            "puzzle_number": current_day,
            "attempts": submission.attempts,
            "solved": submission.solved,
            "score": score
        }
        if submission.group_id:
            data["group_id"] = submission.group_id
            
        response = supabase.table("submissions").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create submission")
            
        return response.data[0]
    except Exception as e:
        error_msg = str(e)
        if "duplicate key value" in error_msg.lower() or "unique constraint" in error_msg.lower() or "23505" in error_msg:
            raise HTTPException(status_code=400, detail="You have already submitted a result for today!")
        raise HTTPException(status_code=400, detail=error_msg)

