from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.players import router as players_router
from app.api.submissions import router as submissions_router
from app.api.leaderboard import router as leaderboard_router

app = FastAPI(title="Wordle League API")

# Configure CORS so the React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players_router)
app.include_router(submissions_router)
app.include_router(leaderboard_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
