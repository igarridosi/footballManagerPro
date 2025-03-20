from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, Literal

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

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Erling Haaland",
                "position": "FW",
                "club": "Manchester City",
                "value": 180.0
            }
        }

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
            
    def setNewPlayerValue(self, newValue: float) -> float:
        try:
            newValue = float(newValue)
            if newValue < 0:
                raise ValueError("Player value cannot be negative")
            self.value = newValue
            return self.value
        except (TypeError, ValueError):
            raise ValueError("Invalid value format. Must be a number")
            
    def setNewClub(self, newClub: str, transferMoney: float) -> str:
        if not newClub or not newClub.strip():
            raise ValueError("New club cannot be empty")
        try:
            transferMoney = float(transferMoney)
            if transferMoney < 0:
                raise ValueError("Transfer money cannot be negative")
                
            self.club = newClub.strip()
            self.setNewPlayerValue(transferMoney)
            return self.club
        except (TypeError, ValueError) as e:
            if "Player value cannot be negative" in str(e):
                raise
            raise ValueError("Invalid transfer money format. Must be a number")

# Initial players data with valid positions
players: list[Player] = [
    Player('Erling Haaland', 'FW', 'Manchester City', 180),
    Player('Jude Bellingham', 'CM', 'Real Madrid', 150),
    Player('Kylian Mbappé', 'FW', 'PSG', 180),
    Player('Vinicius Jr', 'FW', 'Real Madrid', 150),
    Player('Phil Foden', 'CM', 'Manchester City', 130),
] 