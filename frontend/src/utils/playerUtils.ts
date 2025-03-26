import { Player, RandomStats, PlayerProfile } from '../interfaces/types'
import { POSITIONS, NATIONALITIES, FEET } from '../constants'
import axios from 'axios'

export const validatePlayer = (player: any): Player => {
  const validPosition = POSITIONS[player.position as keyof typeof POSITIONS] 
    ? player.position 
    : 'GK'

  return {
    ...player,
    position: validPosition
  }
}

export const generateRandomStats = (position: Player['position']): RandomStats => {
  const today = new Date()
  const age = Math.floor(Math.random() * 15) + 18
  const birthDate = new Date(today.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  const contractYears = Math.floor(Math.random() * 4) + 1
  const contractStart = new Date(today.getFullYear(), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  const contractEnd = new Date(contractStart)
  contractEnd.setFullYear(contractEnd.getFullYear() + contractYears)

  const baseStats = {
    matchesPlayed: Math.floor(Math.random() * 300) + 50,
    minutesPlayed: Math.floor(Math.random() * 25000) + 5000,
    passAccuracy: Number((Math.random() * 20 + 70).toFixed(1)),
    rating: Number((Math.random() * 2 + 7).toFixed(1)),
    personalInfo: {
      age,
      birthDate: birthDate.toISOString().split('T')[0],
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      height: `${Math.floor(Math.random() * 25) + 165} cm`,
      weight: `${Math.floor(Math.random() * 30) + 65} kg`,
      preferredFoot: FEET[Math.floor(Math.random() * FEET.length)],
      contractStart: contractStart.toISOString().split('T')[0],
      contractEnd: contractEnd.toISOString().split('T')[0],
      marketValue: Math.floor(Math.random() * 100) + 1,
      shirtNumber: `#${Math.floor(Math.random() * 99) + 1}`
    },
    trophies: [
      { name: 'Champions League', year: 2023 - Math.floor(Math.random() * 5) },
      { name: 'League Title', year: 2023 - Math.floor(Math.random() * 5) },
      { name: 'Cup', year: 2023 - Math.floor(Math.random() * 5) }
    ].sort((a, b) => b.year - a.year)
  }

  switch (position) {
    case 'GK':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 3),
        assists: Math.floor(Math.random() * 5),
        cleanSheets: Math.floor(Math.random() * 25) + 5,
        savePercentage: Number((Math.random() * 15 + 70).toFixed(1))
      }
    case 'DF':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 21),
        assists: Math.floor(Math.random() * 31),
        tackles: Math.floor(Math.random() * 150) + 50,
        interceptions: Math.floor(Math.random() * 100) + 30
      }
    case 'CM':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 201),
        assists: Math.floor(Math.random() * 251),
        tackles: Math.floor(Math.random() * 100) + 20,
        interceptions: Math.floor(Math.random() * 80) + 20
      }
    case 'FW':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 601),
        assists: Math.floor(Math.random() * 301)
      }
    default:
      return baseStats as RandomStats
  }
}

export const fetchPlayerDetails = async (playerName: string): Promise<Partial<PlayerProfile>> => {
  try {
    const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY
    const footballApi = axios.create({
      baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': FOOTBALL_API_KEY
      }
    })

    // Search for player
    const searchResponse = await footballApi.get('/players', {
      params: {
        search: playerName,
        league: '39',
        season: '2023'
      }
    })

    const player = searchResponse.data.response[0]
    if (!player) {
      throw new Error('Player not found')
    }

    // Get player statistics
    const statsResponse = await footballApi.get('/players', {
      params: {
        id: player.player.id,
        season: '2023'
      }
    })

    const stats = statsResponse.data.response[0].statistics[0]

    return {
      appearances: stats.games.appearences || 0,
      starts: stats.games.lineups || 0,
      minutesPlayed: stats.games.minutes || 0,
      goals: stats.goals.total || 0,
      yellowCards: stats.cards.yellow || 0,
      redCards: stats.cards.red || 0,
      number: player.player.number?.toString() || "N/A",
      dateOfBirth: new Date(player.player.birth.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ` (age ${player.player.age})`,
      placeOfBirth: `${player.player.birth.place || 'Unknown'}, ${player.player.birth.country || 'Unknown'}`,
      nationality: player.player.nationality,
      height: player.player.height || 'Unknown',
      weight: player.player.weight || 'Unknown',
      preferredSide: stats.games.position || 'Unknown'
    }
  } catch (error) {
    console.error('Error fetching player details:', error)
    return {}
  }
} 