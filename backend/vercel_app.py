from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Literal, Optional

# Valid positions
PositionType = Literal['GK', 'DF', 'CM', 'FW']
VALID_POSITIONS = {'GK', 'DF', 'CM', 'FW'}

class PlayerBase(BaseModel):
    name: str = Field(..., min_length=1)
    position: PositionType
    club: str = Field(..., min_length=1)
    value: float = Field(..., ge=0)

    @validator('value')
    def validate_value(cls, v):
        return float(v)

    @validator('position')
    def validate_position(cls, v):
        if v not in VALID_POSITIONS:
            raise ValueError(f"Invalid position. Must be one of: {', '.join(VALID_POSITIONS)}")
        return v

class PlayerResponse(BaseModel):
    name: str
    position: PositionType
    club: str
    value: float

class Player:
    def __init__(self, name: str, position: str, club: str, value: float):
        if not name or not position or not club:
            raise ValueError("Name, position, and club cannot be empty")
        if value < 0:
            raise ValueError("Player value cannot be negative")
        if position not in VALID_POSITIONS:
            raise ValueError(f"Invalid position. Must be one of: {', '.join(VALID_POSITIONS)}")
            
        self.name = name.strip()
        self.position = position.strip()
        self.club = club.strip()
        try:
            self.value = float(value)
        except (TypeError, ValueError):
            raise ValueError("Invalid value format. Must be a number")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "position": self.position,
            "club": self.club,
            "value": self.value
        }
    
    def inOrDecrisePlayerValue(self, amount: float) -> float:
        try:
            amount = float(amount)
            if amount < 0:
                amount = abs(amount)
                self.value -= amount
            else:
                self.value += amount
            return self.value
        except (TypeError, ValueError):
            raise ValueError("Invalid amount format. Must be a number")
            
    def setNewClub(self, newClub: str, transferMoney: float) -> str:
        if not newClub or not newClub.strip():
            raise ValueError("New club cannot be empty")
        try:
            transferMoney = float(transferMoney)
            if transferMoney < 0:
                raise ValueError("Transfer money cannot be negative")
                
            self.club = newClub.strip()
            self.value = transferMoney
            return self.club
        except (TypeError, ValueError) as e:
            if "Player value cannot be negative" in str(e):
                raise
            raise ValueError("Invalid transfer money format. Must be a number")

# Initial players data
players: list[Player] = [
    Player('Erling Haaland', 'FW', 'Manchester City', 180),
    Player('Jude Bellingham', 'CM', 'Real Madrid', 150),
    Player('Kylian Mbappé', 'FW', 'PSG', 180),
    Player('Vinicius Jr', 'FW', 'Real Madrid', 150),
    Player('Phil Foden', 'CM', 'Manchester City', 130),
]

app = FastAPI(title="Football Manager API")

# Configure CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://football-manager-ejmb55h27-igarridosis-projects.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/players", response_model=List[PlayerResponse])
async def get_players():
    try:
        return [player.to_dict() for player in players]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/players", response_model=PlayerResponse, status_code=201)
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

@app.put("/api/players/{player_id}/transfer", response_model=PlayerResponse)
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

@app.delete("/api/players/{player_id}", response_model=PlayerResponse)
async def delete_player(player_id: int):
    if not 0 <= player_id < len(players):
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        deleted_player = players.pop(player_id)
        return deleted_player.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") 