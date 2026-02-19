from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/profile")
def profile(user_id: int = Query(..., description="ID of the user")):
    # Dummy profile data
    return {"user_id": user_id, "name": "Mohammed Awal", "role": "user"}
