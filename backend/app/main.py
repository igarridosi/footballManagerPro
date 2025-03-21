from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from .models import Player, PlayerBase, PlayerResponse, players

app = FastAPI(title="Football Manager API")

# Configure CORS - Allow all origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )

@app.get("/")
async def root():
    return {"message": "Welcome to Football Manager API"}

@app.get("/players", response_model=List[PlayerResponse])
async def get_players():
    try:
        return [player.to_dict() for player in players]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/players", response_model=PlayerResponse, status_code=201)
async def create_player(player_data: PlayerBase):
    try:
        value = float(player_data.value)
        if value < 0:
            raise ValueError("Player value cannot be negative")

        new_player = Player(
            name=player_data.name,
            position=player_data.position,
            club=player_data.club,
            value=value
        )
        players.append(new_player)
        return new_player.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/players/{player_id}/transfer", response_model=PlayerResponse)
async def transfer_player(player_id: int, new_club: str, transfer_money: float):
    if not 0 <= player_id < len(players):
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        players[player_id].setNewClub(new_club, transfer_money)
        return players[player_id].to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.put("/players/{player_id}/value", response_model=PlayerResponse)
async def update_player_value(player_id: int, amount: float):
    if not 0 <= player_id < len(players):
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        players[player_id].inOrDecrisePlayerValue(amount)
        return players[player_id].to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.delete("/players/{player_id}", response_model=PlayerResponse)
async def delete_player(player_id: int):
    if not 0 <= player_id < len(players):
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        deleted_player = players.pop(player_id)
        return deleted_player.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 