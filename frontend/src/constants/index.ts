import { Player } from '../interfaces/types'

export const POSITIONS = {
  GK: { label: 'Goalkeeper', color: 'bg-orange-100 text-orange-800' },
  DF: { label: 'Defender', color: 'bg-purple-100 text-purple-800' },
  CM: { label: 'Midfielder', color: 'bg-green-100 text-green-800' },
  FW: { label: 'Forward', color: 'bg-blue-100 text-blue-800' }
} as const

export const DEFAULT_CLUBS = [
  'Manchester City',
  'Real Madrid',
  'PSG',
  'Barcelona',
  'Bayern Munich',
  'Liverpool',
  'Manchester United',
  'Chelsea',
  'Arsenal',
  'Juventus'
]

export const DEFAULT_PLAYERS: Player[] = [
  { id: '1', name: 'Manuel Neuer', position: 'GK', club: 'Bayern Munich', value: 25 },
  { id: '2', name: 'Virgil van Dijk', position: 'DF', club: 'Liverpool', value: 75 },
  { id: '3', name: 'Kevin De Bruyne', position: 'CM', club: 'Manchester City', value: 100 },
  { id: '4', name: 'Erling Haaland', position: 'FW', club: 'Manchester City', value: 180 }
]

export const STORAGE_KEY = 'footballManagerPlayers'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const NATIONALITIES = [
  'Spain', 'England', 'France', 'Germany', 'Italy', 'Portugal', 'Brazil', 'Argentina', 
  'Netherlands', 'Belgium', 'Croatia', 'Uruguay', 'Colombia', 'Norway', 'Sweden'
]

export const FEET = ['Right', 'Left', 'Both'] 