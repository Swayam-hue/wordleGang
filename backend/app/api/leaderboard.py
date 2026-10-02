from fastapi import APIRouter
from app.database.supabase import supabase

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("/today")
def get_todays_leaderboard():
    # 1. Find the latest puzzle_number submitted
    # Since we can't easily do complex aggregations via Supabase JS/Python client without RPC,
    # we can fetch the latest submission to determine the current puzzle_number.
    latest_sub = supabase.table("submissions").select("puzzle_number").order("created_at", desc=True).limit(1).execute()
    
    if not latest_sub.data:
        return []
        
    current_puzzle = latest_sub.data[0]["puzzle_number"]
    
    # 2. Fetch all submissions for this puzzle, joined with player info
    # Supabase allows joining if foreign keys are set up correctly.
    # We will try joining, or fallback to fetching separately if the schema doesn't support it.
    submissions = supabase.table("submissions") \
        .select("score, attempts, solved, players(name)") \
        .eq("puzzle_number", current_puzzle) \
        .order("score", desc=True) \
        .order("attempts", desc=False) \
        .execute()
        
    leaderboard = []
    for idx, sub in enumerate(submissions.data):
        player_name = sub.get("players", {}).get("name", "Unknown Player") if sub.get("players") else "Unknown Player"
        leaderboard.append({
            "rank": idx + 1,
            "player": player_name,
            "score": sub["score"],
            "attempts": sub["attempts"],
            "solved": sub["solved"]
        })
        
    return leaderboard
