export interface Player {
  id: string
  name: string
  position: 'GK' | 'DF' | 'CM' | 'FW'
  club: string
  value: number
  stats?: RandomStats
}

export interface PlayerProfile {
  appearances: number
  starts: number
  minutesPlayed: number
  goals: number
  yellowCards: number
  redCards: number
  number: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  height: string
  weight: string
  preferredSide: string
}

export interface PlayerPersonalInfo {
  age: number
  birthDate: string
  nationality: string
  height: string
  weight: string
  preferredFoot: string
  contractStart: string
  contractEnd: string
  marketValue: number
  shirtNumber: string
}

export interface RandomStats {
  matchesPlayed: number
  minutesPlayed: number
  passAccuracy: number
  rating: number
  goals?: number
  assists?: number
  cleanSheets?: number
  savePercentage?: number
  tackles?: number
  interceptions?: number
  personalInfo: {
    age: number
    birthDate: string
    nationality: string
    height: string
    weight: string
    preferredFoot: string
    contractStart: string
    contractEnd: string
    marketValue: number
    shirtNumber: string
  }
  trophies: Array<{
    name: string
    year: number
  }>
}

export interface SortConfig {
  key: keyof Player
  direction: 'asc' | 'desc'
}

export interface Filters {
  position: string
  club: string
  valueRange: {
    min: string
    max: string
  }
}

export interface PlayerComparison {
  players: Player[]
  selectedStats: string[]
}

export interface Transfer {
  id: string
  playerId: string
  playerName: string
  fromClub: string
  toClub: string
  fee: number
  date: string
}

export interface SquadStats {
  totalValue: number
  valueChange: number
  positionDistribution: {
    [key: string]: number
  }
  recentTransfers: Transfer[]
  performance: {
    totalGoals: number
    totalAssists: number
    averageRating: number
    cleanSheets: number
    passAccuracy: number
  }
}

export interface FilterState {
  position: string
  club: string
  minValue: number
  maxValue: number
  searchTerm: string
} 