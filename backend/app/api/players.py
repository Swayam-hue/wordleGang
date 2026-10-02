from fastapi import APIRouter, HTTPException
from app.schemas.player import PlayerCreate, PlayerResponse
from app.database.supabase import supabase

router = APIRouter(prefix="/players", tags=["players"])

@router.post("", response_model=PlayerResponse)
def create_player(player: PlayerCreate):
    try:
        data = {
            "name": player.name
        }
        if player.group_id:
            data["group_id"] = player.group_id
            
        response = supabase.table("players").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create player")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{player_id}/history")
def get_player_history(player_id: str):
    try:
        player_res = supabase.table("players").select("*").eq("id", player_id).execute()
        if not player_res.data:
            raise HTTPException(status_code=404, detail="Player not found")
        player_data = player_res.data[0]
        
        subs_res = supabase.table("submissions").select("*").eq("player_id", player_id).order("puzzle_number", desc=True).execute()
        submissions = subs_res.data
        
        total_score = sum(s["score"] for s in submissions)
        games_played = len(submissions)
        wins = sum(1 for s in submissions if s["solved"])
        failures = games_played - wins
        
        solved_attempts = [s["attempts"] for s in submissions if s["solved"]]
        average_attempts = round(sum(solved_attempts) / len(solved_attempts), 2) if solved_attempts else 0.0
        
        # Calculate streaks
        current_streak = 0
        best_streak = 0
        temp_streak = 0
        last_puzzle = None
        
        # We iterate from oldest to newest to calculate streak correctly
        for s in reversed(submissions):
            if s["solved"]:
                if last_puzzle is None or s["puzzle_number"] == last_puzzle + 1:
                    temp_streak += 1
                else:
                    temp_streak = 1
            else:
                temp_streak = 0
            
            if temp_streak > best_streak:
                best_streak = temp_streak
            
            last_puzzle = s["puzzle_number"]
            current_streak = temp_streak
            
        # If the player missed a day, current streak should be broken.
        # But we don't know the "current" puzzle number globally without a separate query.
        # For MVP, current streak is based on their own consecutive plays ending at their latest play.
            
        return {
            "player": player_data,
            "metrics": {
                "total_score": total_score,
                "games_played": games_played,
                "average_attempts": average_attempts,
                "wins": wins,
                "failures": failures,
                "current_streak": current_streak,
                "best_streak": best_streak
            },
            "history": submissions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

