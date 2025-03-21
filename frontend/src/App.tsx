import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { PlusIcon, ArrowPathIcon, TrashIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon, XMarkIcon, SunIcon, MoonIcon, ArrowsUpDownIcon, FunnelIcon, ArrowRightIcon, ChartBarIcon, CalendarIcon, ChartBarSquareIcon, ArrowsRightLeftIcon, PencilIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface Player {
  name: string
  position: 'GK' | 'DF' | 'CM' | 'FW'
  club: string
  value: number
}

interface PlayerProfile extends Player {
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
  dateSigned: string
  contractEnds: string
}

const POSITIONS = {
  GK: { label: 'Goalkeeper', color: 'bg-orange-100 text-orange-800' },
  DF: { label: 'Defender', color: 'bg-purple-100 text-purple-800' },
  CM: { label: 'Midfielder', color: 'bg-green-100 text-green-800' },
  FW: { label: 'Forward', color: 'bg-blue-100 text-blue-800' }
} as const

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Configure axios defaults with simpler configuration
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

const STORAGE_KEY = 'footballManagerPlayers'

// API Football configuration
const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY
const footballApi = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
  headers: {
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    'x-rapidapi-key': FOOTBALL_API_KEY
  }
})

// Helper function to validate and fix player positions
const validatePlayer = (player: any): Player => {
  const validPosition = POSITIONS[player.position as keyof typeof POSITIONS] 
    ? player.position 
    : 'GK' // Default to GK if invalid position

  return {
    ...player,
    position: validPosition
  }
}

async function fetchPlayerDetails(playerName: string): Promise<Partial<PlayerProfile>> {
  try {
    // Search for player
    const searchResponse = await footballApi.get('/players', {
      params: {
        search: playerName,
        league: '39', // Premier League (you can add more leagues)
        season: '2023' // Current season
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

// Modificar la interfaz RandomStats para incluir más datos personales
interface PlayerPersonalInfo {
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

interface RandomStats {
  goals: number
  assists: number
  matchesPlayed: number
  minutesPlayed: number
  rating: number
  cleanSheets?: number
  savePercentage?: number
  tackles?: number
  interceptions?: number
  passAccuracy: number
  personalInfo: PlayerPersonalInfo
  trophies: {
    name: string
    year: number
  }[]
}

const NATIONALITIES = [
  'Spain', 'England', 'France', 'Germany', 'Italy', 'Portugal', 'Brazil', 'Argentina', 
  'Netherlands', 'Belgium', 'Croatia', 'Uruguay', 'Colombia', 'Norway', 'Sweden'
]

const FEET = ['Right', 'Left', 'Both']

function generateRandomStats(position: Player['position']): RandomStats {
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
        goals: Math.floor(Math.random() * 3), // 0-2 goles
        assists: Math.floor(Math.random() * 5), // 0-4 asistencias
        cleanSheets: Math.floor(Math.random() * 25) + 5, // 5-29 porterías a cero
        savePercentage: Number((Math.random() * 15 + 70).toFixed(1)) // 70-85% paradas
      }
    case 'DF':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 21), // 0-20 goles
        assists: Math.floor(Math.random() * 31), // 0-30 asistencias
        tackles: Math.floor(Math.random() * 150) + 50, // 50-199 tackles
        interceptions: Math.floor(Math.random() * 100) + 30 // 30-129 intercepciones
      }
    case 'CM':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 201), // 0-200 goles
        assists: Math.floor(Math.random() * 251), // 0-250 asistencias
        tackles: Math.floor(Math.random() * 100) + 20, // 20-119 tackles
        interceptions: Math.floor(Math.random() * 80) + 20 // 20-99 intercepciones
      }
    case 'FW':
      return {
        ...baseStats,
        goals: Math.floor(Math.random() * 601), // 0-600 goles
        assists: Math.floor(Math.random() * 301), // 0-300 asistencias
      }
    default:
      return baseStats as RandomStats
  }
}

function PlayerProfileModal({ player, onClose, onUpdate }: { 
  player: Player, 
  onClose: () => void,
  onUpdate: (updatedPlayer: Player) => void 
}) {
  const [profileData, setProfileData] = useState<Partial<PlayerProfile>>({})
  const [loading, setLoading] = useState(true)
  const [randomStats] = useState<RandomStats>(generateRandomStats(player.position))
  const [isEditing, setIsEditing] = useState(false)
  const [editedPlayer, setEditedPlayer] = useState({
    ...player,
    ...randomStats.personalInfo
  })

  useEffect(() => {
    const loadPlayerDetails = async () => {
      setLoading(true)
      const details = await fetchPlayerDetails(player.name)
      setProfileData(details)
      setLoading(false)
    }

    loadPlayerDetails()
  }, [player.name])

  const handleSave = () => {
    // Actualizar el jugador en el estado principal
    onUpdate({
    ...player,
      name: editedPlayer.name,
      position: editedPlayer.position,
      club: player.club,
      value: editedPlayer.marketValue
    })
    setIsEditing(false)
  }

  const renderStatValue = (label: string, value: number | string, unit: string = '') => (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      {isEditing && typeof value === 'number' ? (
        <input
          type="number"
          value={value}
          onChange={(e) => setEditedPlayer({
            ...editedPlayer,
            [label.toLowerCase().replace(' ', '')]: parseFloat(e.target.value)
          })}
          className="bg-gray-800 text-white rounded px-2 py-1 w-24 text-right"
        />
      ) : (
        <span>{value}{unit}</span>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1C1C1C] text-white rounded-lg w-full max-w-4xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPlayer.name}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                  className="bg-gray-800 text-white text-4xl font-bold px-2 py-1 rounded"
                />
              ) : (
                <h2 className="text-4xl font-bold">{player.name}</h2>
              )}
              <div className="text-2xl text-gray-400 mt-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPlayer.shirtNumber}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, shirtNumber: e.target.value })}
                    className="bg-gray-800 text-white px-2 py-1 rounded w-20"
                  />
                ) : editedPlayer.shirtNumber}
            </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-400 hover:text-white"
              >
                <PencilIcon className="h-6 w-6" />
              </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-5xl font-bold mb-2">{randomStats.goals}</div>
                    <div className="text-gray-400">Goals</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{randomStats.assists}</div>
                    <div className="text-gray-400">Assists</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{randomStats.matchesPlayed}</div>
                    <div className="text-gray-400">Matches</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{randomStats.rating}</div>
                    <div className="text-gray-400">Rating</div>
                  </div>
                  </div>
                {/* Estadísticas específicas por posición */}
                <div className="mt-6 space-y-2">
                  {player.position === 'GK' && (
                    <>
                      {renderStatValue('Clean Sheets', randomStats.cleanSheets || 0)}
                      {renderStatValue('Save Percentage', randomStats.savePercentage || 0, '%')}
                    </>
                  )}
                  {(player.position === 'DF' || player.position === 'CM') && (
                    <>
                      {renderStatValue('Tackles', randomStats.tackles || 0)}
                      {renderStatValue('Interceptions', randomStats.interceptions || 0)}
                    </>
                  )}
                  {renderStatValue('Pass Accuracy', randomStats.passAccuracy, '%')}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  {isEditing ? (
                    <select
                      value={editedPlayer.position}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, position: e.target.value as Player['position'] })}
                      className="bg-gray-800 text-white rounded px-2 py-1"
                    >
                      {Object.entries(POSITIONS).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-sm ${POSITIONS[player.position].color}`}>
                      {POSITIONS[player.position].label}
                  </span>
                  )}
                </div>
                {[
                  ['Nationality', 'nationality'],
                  ['Birth Date', 'birthDate'],
                  ['Birth Place', 'placeOfBirth'],
                  ['Height', 'height'],
                  ['Weight', 'weight'],
                  ['Preferred Foot', 'preferredFoot'],
                  ['Market Value', 'marketValue']
                ].map(([label, key]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{label}:</span>
                    {isEditing ? (
                      <input
                        type={key === 'marketValue' ? 'number' : 'text'}
                        value={editedPlayer[key as keyof typeof editedPlayer]}
                        onChange={(e) => setEditedPlayer({
                          ...editedPlayer,
                          [key]: key === 'marketValue' ? parseFloat(e.target.value) : e.target.value
                        })}
                        className="bg-gray-800 text-white rounded px-2 py-1 w-40 text-right"
                      />
                    ) : (
                      <span>
                        {key === 'marketValue' 
                          ? `${editedPlayer[key as keyof typeof editedPlayer]}M €`
                          : editedPlayer[key as keyof typeof editedPlayer]
                        }
                      </span>
                    )}
                </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Start:</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedPlayer.contractStart}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, contractStart: e.target.value })}
                      className="bg-gray-800 text-white rounded px-2 py-1"
                    />
                  ) : (
                    <span>{editedPlayer.contractStart}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract End:</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedPlayer.contractEnd}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, contractEnd: e.target.value })}
                      className="bg-gray-800 text-white rounded px-2 py-1"
                    />
                  ) : (
                    <span>{editedPlayer.contractEnd}</span>
                  )}
                </div>
                </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Trophies</h3>
                {randomStats.trophies.map((trophy, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <TrophyIcon className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">{trophy.name}</div>
                      <div className="text-sm text-gray-400">{trophy.year}</div>
                </div>
                </div>
                ))}
                </div>
                </div>
          )}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TransferNews({ player, club, transferMoney, actualClub, onClose }: { 
  player: string, 
  club: string, 
  transferMoney: number, 
  actualClub: string,
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <img src="../fabrizio-fauna.jpg" 
                alt="Fabrizio Fauna" 
                className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-blue-500"/>
            <div>
              <h3 className="font-bold text-lg">Fabrizio Fauna</h3>
              <p className="text-gray-500 text-sm">@FabrizioFauna</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-xl font-medium mb-4">
          Here We GO!! {player} to {club}. 
          <br/>
          Official Agreement in principle with {actualClub}, €{transferMoney}m fee.. 🚨‼️
        </p>
        <div className="flex justify-end space-x-2">
          <button className="text-blue-500 hover:text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path>
            </svg>
          </button>
          <button className="text-red-500 hover:text-red-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferModal({ player, onTransfer, onClose }: {
  player: Player;
  onTransfer: (newClub: string, transferMoney: number) => void;
  onClose: () => void;
}) {
  const [newClub, setNewClub] = useState('')
  const [transferMoney, setTransferMoney] = useState('')
  const [showNewClubInput, setShowNewClubInput] = useState(false)
  const [clubs, setClubs] = useState<string[]>([
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
  ].filter(club => club !== player.club))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const money = parseFloat(transferMoney)
    if (newClub && !isNaN(money)) {
      onTransfer(newClub, money)
    }
  }

  const handleAddClub = () => {
    if (newClub.trim()) {
      setClubs([...clubs, newClub.trim()])
      setShowNewClubInput(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">Transfer {player.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showNewClubInput ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="New Club Name"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                value={newClub}
                onChange={(e) => setNewClub(e.target.value)}
                required
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddClub}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Club
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewClubInput(false)
                    setNewClub('')
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={newClub}
                onChange={(e) => setNewClub(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                required
              >
                <option value="">Select Club</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewClubInput(true)}
                className="w-full px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Add New Club
              </button>
            </div>
          )}
          <input
            type="number"
            placeholder="Transfer Fee (M€)"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
            value={transferMoney}
            onChange={(e) => setTransferMoney(e.target.value)}
            required
            min="0"
            step="0.1"
          />
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Complete Transfer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Añadir nuevas interfaces para el filtrado y ordenación
interface SortConfig {
  key: keyof Player
  direction: 'asc' | 'desc'
}

interface Filters {
  position: string
  club: string
  valueRange: {
    min: string
    max: string
  }
}

// Añadir nuevas interfaces para estadísticas y calendario
interface PlayerStats {
  form: number[]
  marketValueHistory: { date: string; value: number }[]
}

interface ScheduledTransfer {
  playerId: number
  playerName: string
  fromClub: string
  toClub: string
  transferFee: number
  date: string
  status: 'pending' | 'completed' | 'cancelled'
}

// Nueva interfaz para la comparación de jugadores
interface PlayerComparison {
  players: Player[]
  selectedStats: string[]
}

// Modificar la interfaz de transferencias
interface TransferHistory {
  playerId: number
  playerName: string
  fromClub: string
  toClub: string
  transferFee: number
  date: string
}

// Nueva interfaz para el análisis de mercado
interface MarketAnalysis {
  topTransfers: {
    playerName: string
    fromClub: string
    toClub: string
    fee: number
    season: string
  }[]
  marketTrends: {
    position: keyof typeof POSITIONS
    averageValue: number
    valueChange: number
    topLeagues: {
      league: string
      averageValue: number
    }[]
  }[]
  upcomingTransfers: {
    playerName: string
    currentClub: string
    potentialClubs: string[]
    estimatedValue: number
  }[]
}

// Añadir nueva interfaz para Market Values
interface MarketValue {
  position: keyof typeof POSITIONS
  averageValue: number
  topPlayers: {
    name: string
    club: string
    value: number
    change: number
  }[]
  leagueDistribution: {
    league: string
    percentage: number
  }[]
}

function MarketValuesSection({ darkMode }: { darkMode: boolean }) {
  const marketData: MarketValue[] = [
    {
      position: 'FW',
      averageValue: 42.5,
      topPlayers: [
        { name: 'Erling Haaland', club: 'Manchester City', value: 180, change: 30 },
        { name: 'Kylian Mbappé', club: 'PSG', value: 180, change: -20 },
        { name: 'Vinicius Jr.', club: 'Real Madrid', value: 150, change: 50 }
      ],
      leagueDistribution: [
        { league: 'Premier League', percentage: 45 },
        { league: 'La Liga', percentage: 25 },
        { league: 'Bundesliga', percentage: 15 },
        { league: 'Serie A', percentage: 10 },
        { league: 'Ligue 1', percentage: 5 }
      ]
    },
    {
      position: 'CM',
      averageValue: 35.8,
      topPlayers: [
        { name: 'Jude Bellingham', club: 'Real Madrid', value: 150, change: 70 },
        { name: 'Rodri', club: 'Manchester City', value: 110, change: 20 },
        { name: 'Pedri', club: 'Barcelona', value: 100, change: -5 }
      ],
      leagueDistribution: [
        { league: 'Premier League', percentage: 40 },
        { league: 'La Liga', percentage: 30 },
        { league: 'Bundesliga', percentage: 15 },
        { league: 'Serie A', percentage: 10 },
        { league: 'Ligue 1', percentage: 5 }
      ]
    }
  ]

  return (
    <div className={`${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    } shadow-lg rounded-xl p-6 mb-8`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Market Values
        </h3>
        <a
          href="https://www.transfermarkt.es/"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
        >
          View on Transfermarkt
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketData.map((data, index) => (
          <div
            key={index}
            className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                POSITIONS[data.position].color
              }`}>
                {POSITIONS[data.position].label}s
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Avg. Value: {data.averageValue}M €
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Top Players by Value
                </h4>
                <div className="space-y-2">
                  {data.topPlayers.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {player.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {player.club}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {player.value}M €
                        </p>
                        <p className={`text-xs ${
                          player.change > 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {player.change > 0 ? '+' : ''}{player.change}M €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  League Distribution
                </h4>
                <div className="space-y-2">
                  {data.leagueDistribution.map((league, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-24`}>
                        {league.league}
                      </span>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${league.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {league.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketAnalysisPanel({ darkMode }: { darkMode: boolean }) {
  const [analysis, setAnalysis] = useState<MarketAnalysis>({
    topTransfers: [
      {
        playerName: "Jude Bellingham",
        fromClub: "Borussia Dortmund",
        toClub: "Real Madrid",
        fee: 103,
        season: "2023/24"
      },
      {
        playerName: "Enzo Fernández",
        fromClub: "Benfica",
        toClub: "Chelsea",
        fee: 121,
        season: "2022/23"
      },
      {
        playerName: "Declan Rice",
        fromClub: "West Ham",
        toClub: "Arsenal",
        fee: 117,
        season: "2023/24"
      }
    ],
    marketTrends: [
      {
        position: "FW",
        averageValue: 45.2,
        valueChange: 12.5,
        topLeagues: [
          { league: "Premier League", averageValue: 52.8 },
          { league: "La Liga", averageValue: 48.3 },
          { league: "Bundesliga", averageValue: 41.7 }
        ]
      },
      {
        position: "CM",
        averageValue: 38.6,
        valueChange: 15.2,
        topLeagues: [
          { league: "Premier League", averageValue: 45.1 },
          { league: "La Liga", averageValue: 42.8 },
          { league: "Serie A", averageValue: 36.9 }
        ]
      }
    ],
    upcomingTransfers: [
      {
        playerName: "Kylian Mbappé",
        currentClub: "PSG",
        potentialClubs: ["Real Madrid", "Liverpool", "Arsenal"],
        estimatedValue: 180
      },
      {
        playerName: "Victor Osimhen",
        currentClub: "Napoli",
        potentialClubs: ["Chelsea", "PSG", "Manchester United"],
        estimatedValue: 120
      }
    ]
  })

  return (
    <div className={`${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    } shadow-lg rounded-xl p-6 mb-8`}>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
        Market Analysis
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Transfers */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4`}>
          <h4 className={`text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
            Recent Top Transfers
          </h4>
          <div className="space-y-4">
            {analysis.topTransfers.map((transfer, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'} rounded-lg p-3`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transfer.playerName}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    €{transfer.fee}M
                  </span>
                </div>
                <div className="flex items-center text-sm mt-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {transfer.fromClub}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 mx-2" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {transfer.toClub}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4`}>
          <h4 className={`text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
            Market Trends
          </h4>
          <div className="space-y-4">
            {analysis.marketTrends.map((trend, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'} rounded-lg p-3`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {POSITIONS[trend.position].label}s
                  </span>
                  <span className={`text-sm ${
                    trend.valueChange > 0 
                      ? darkMode ? 'text-green-400' : 'text-green-600'
                      : darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {trend.valueChange > 0 ? '+' : ''}{trend.valueChange}%
                  </span>
                </div>
                <div className="space-y-1">
                  {trend.topLeagues.map((league, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {league.league}
                      </span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        €{league.averageValue}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Transfers */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4`}>
          <h4 className={`text-md font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
            Transfer Rumors
          </h4>
          <div className="space-y-4">
            {analysis.upcomingTransfers.map((transfer, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'} rounded-lg p-3`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transfer.playerName}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    €{transfer.estimatedValue}M
                  </span>
                </div>
                <div className="text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Current: {transfer.currentClub}
                  </span>
                  <div className="mt-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Potential: {transfer.potentialClubs.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [clubs, setClubs] = useState<string[]>([
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
  ])
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: '',
    position: 'GK',
    club: '',
    value: 0
  })
  const [showNewClubInput, setShowNewClubInput] = useState(false)
  const [newClub, setNewClub] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [transferNews, setTransferNews] = useState<{
    player: string;
    club: string;
    transferMoney: number;
    actualClub: string;
  } | null>(null)
  const [transferModalPlayer, setTransferModalPlayer] = useState<Player | null>(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    position: '',
    club: '',
    valueRange: { min: '', max: '' } // Cambiado de number a string para mejor manejo del input
  })
  const [playerStats, setPlayerStats] = useState<{ [key: string]: RandomStats }>({})
  const [scheduledTransfers, setScheduledTransfers] = useState<ScheduledTransfer[]>([])
  const [showSchedule, setShowSchedule] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparison, setComparison] = useState<PlayerComparison>({
    players: [],
    selectedStats: ['value', 'position']
  })
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([])
  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false)

  // Efecto para manejar el modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Crear una constante con los jugadores predeterminados
  const DEFAULT_PLAYERS: Player[] = [
    { name: 'Manuel Neuer', position: 'GK' as const, club: 'Bayern Munich', value: 25 },
    { name: 'Virgil van Dijk', position: 'DF' as const, club: 'Liverpool', value: 75 },
    { name: 'Kevin De Bruyne', position: 'CM' as const, club: 'Manchester City', value: 100 },
    { name: 'Erling Haaland', position: 'FW' as const, club: 'Manchester City', value: 180 }
  ]

  // Modificar la función fetchPlayers para que respete los jugadores guardados
  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const savedPlayers = localStorage.getItem(STORAGE_KEY)
      
      if (savedPlayers) {
        try {
          const parsedPlayers = JSON.parse(savedPlayers)
          if (Array.isArray(parsedPlayers) && parsedPlayers.length > 0) {
            const validatedPlayers = parsedPlayers.map(validatePlayer)
            setPlayers(validatedPlayers)
            console.log('Players loaded from localStorage:', validatedPlayers.length)
          } else {
            console.log('No valid players found in localStorage, setting default players...')
            setPlayers(DEFAULT_PLAYERS)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
          }
        } catch (error) {
          console.error('Error parsing saved players:', error)
          setPlayers(DEFAULT_PLAYERS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
        }
      } else {
        console.log('No players in localStorage, setting default players...')
        setPlayers(DEFAULT_PLAYERS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
      }

      toast.success('Players list refreshed!')
    } catch (error: any) {
      console.error('Error fetching players:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch players'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Modificar el useEffect inicial para cargar los datos correctamente
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const savedPlayers = localStorage.getItem(STORAGE_KEY)
        const savedStats = localStorage.getItem('playerStats')

        if (savedPlayers) {
          const parsedPlayers = JSON.parse(savedPlayers)
          if (Array.isArray(parsedPlayers) && parsedPlayers.length > 0) {
            const validatedPlayers = parsedPlayers.map(validatePlayer)
            setPlayers(validatedPlayers)

            // Cargar o generar estadísticas
            if (savedStats) {
              setPlayerStats(JSON.parse(savedStats))
            } else {
              const newStats = validatedPlayers.reduce((acc, player) => {
                acc[player.name] = generateRandomStats(player.position)
                return acc
              }, {} as { [key: string]: RandomStats })
              setPlayerStats(newStats)
              localStorage.setItem('playerStats', JSON.stringify(newStats))
            }
          } else {
            throw new Error('Invalid players data')
          }
        } else {
          // Si no hay datos guardados, usar los predeterminados
          setPlayers(DEFAULT_PLAYERS)
          const defaultStats = DEFAULT_PLAYERS.reduce((acc, player) => {
            acc[player.name] = generateRandomStats(player.position)
            return acc
          }, {} as { [key: string]: RandomStats })
          setPlayerStats(defaultStats)
          
          // Guardar en localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
          localStorage.setItem('playerStats', JSON.stringify(defaultStats))
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
        // En caso de error, usar los predeterminados
        setPlayers(DEFAULT_PLAYERS)
        const defaultStats = DEFAULT_PLAYERS.reduce((acc, player) => {
          acc[player.name] = generateRandomStats(player.position)
          return acc
        }, {} as { [key: string]: RandomStats })
        setPlayerStats(defaultStats)
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
        localStorage.setItem('playerStats', JSON.stringify(defaultStats))
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!loading && players.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
        console.log('Players saved to localStorage:', players.length)
      } catch (error) {
        console.error('Error saving players to localStorage:', error)
      }
    }
  }, [players, loading])

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      const response = await axios.post('/players', {
        name: newPlayer.name.trim(),
        position: newPlayer.position,  // Remove trim() as position is now from select
        club: newPlayer.club.trim(),
        value: parseFloat(newPlayer.value.toString())
      })
      
      toast.success('Player added successfully!')
      const validatedPlayer = validatePlayer(response.data)
      const updatedPlayers = [...players, validatedPlayer]
      setPlayers(updatedPlayers)
      setNewPlayer({ name: '', position: 'GK', club: '', value: 0 })
    } catch (error: any) {
      console.error('Error adding player:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add player'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTransfer = async (index: number, newClub: string, transferMoney: number) => {
    try {
      const actualClub = players[index].club;
      const response = await axios.put(`/players/${index}/transfer`, null, {
        params: { new_club: newClub.trim(), transfer_money: transferMoney }
      })
      toast.success('Transfer completed successfully!')
      const updatedPlayers = [...players]
      updatedPlayers[index] = response.data
      setPlayers(updatedPlayers)
      
      // Añadir al historial de transferencias
      const newTransfer: TransferHistory = {
        playerId: index,
        playerName: players[index].name,
        fromClub: actualClub,
        toClub: newClub,
        transferFee: transferMoney,
        date: new Date().toISOString().split('T')[0]
      }
      setTransferHistory(prev => [newTransfer, ...prev])
      
      setTransferNews({
        player: players[index].name,
        club: newClub,
        transferMoney,
        actualClub
      })
    } catch (error: any) {
      console.error('Error transferring player:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Transfer failed'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (playerToDelete: Player) => {
    try {
      // Encontrar el índice del jugador por nombre
      const index = players.findIndex(p => p.name === playerToDelete.name)
      if (index === -1) {
        throw new Error('Player not found')
      }

      // Eliminar el jugador del estado
      const updatedPlayers = players.filter(player => player.name !== playerToDelete.name)
      setPlayers(updatedPlayers)

      // Eliminar las estadísticas del jugador
      const updatedStats = { ...playerStats }
      delete updatedStats[playerToDelete.name]
      setPlayerStats(updatedStats)

      // Eliminar el jugador de la comparación si está seleccionado
      if (comparison.players.some(p => p.name === playerToDelete.name)) {
        setComparison(prev => ({
          ...prev,
          players: prev.players.filter(p => p.name !== playerToDelete.name)
        }))
      }

      await axios.delete(`/players/${index}`)
      toast.success('Player removed successfully!')
    } catch (error: any) {
      console.error('Error deleting player:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to remove player'
      toast.error(errorMessage)
    }
  }

  // Modificar la función clearStoredData para manejar mejor la limpieza y restauración
  const clearStoredData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will restore default players.')) {
      try {
        // Generar estadísticas para los jugadores predeterminados
        const defaultStats = DEFAULT_PLAYERS.reduce((acc, player) => {
          acc[player.name] = generateRandomStats(player.position)
          return acc
        }, {} as { [key: string]: RandomStats })

        // Actualizar todos los estados
        setPlayers(DEFAULT_PLAYERS)
        setPlayerStats(defaultStats)
        setTransferHistory([])
        setComparison({ players: [], selectedStats: ['value', 'position'] })
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS))
        localStorage.setItem('playerStats', JSON.stringify(defaultStats))
        
        toast.success('Data cleared and default players restored!')
      } catch (error) {
        console.error('Error resetting to default data:', error)
        toast.error('Error resetting data')
      }
    }
  }

  const handleAddClub = () => {
    if (newClub.trim()) {
      setClubs([...clubs, newClub.trim()])
      setNewPlayer({ ...newPlayer, club: newClub.trim() })
      setNewClub('')
      setShowNewClubInput(false)
    }
  }

  // Función para ordenar jugadores
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Función para filtrar jugadores (corregida)
  const filteredPlayers = sortedPlayers.filter(player => {
    const positionMatch = !filters.position || player.position === filters.position
    const clubMatch = !filters.club || player.club.toLowerCase().includes(filters.club.toLowerCase())
    const minValue = filters.valueRange.min === '' ? 0 : parseFloat(filters.valueRange.min)
    const maxValue = filters.valueRange.max === '' ? Infinity : parseFloat(filters.valueRange.max)
    const valueMatch = player.value >= minValue && player.value <= maxValue
    return positionMatch && clubMatch && valueMatch
  })

  // Modificar la función generatePlayerStats para que use estadísticas almacenadas
  const generatePlayerStats = (playerName: string) => {
    if (!playerStats[playerName]) {
      const position = players.find(p => p.name === playerName)?.position || 'GK'
      const stats = generateRandomStats(position)
      // Guardar las estadísticas en localStorage
      const updatedStats = {
        ...playerStats,
        [playerName]: stats
      }
      setPlayerStats(updatedStats)
      localStorage.setItem('playerStats', JSON.stringify(updatedStats))
      return stats
    }
    return playerStats[playerName]
  }

  // Cargar las estadísticas guardadas al iniciar
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats')
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats)
        setPlayerStats(parsedStats)
      } catch (error) {
        console.error('Error loading player stats:', error)
      }
    }
  }, [])

  // Modificar el botón de Market Analysis para que abra transfermarkt.es
  const openTransfermarkt = () => {
    window.open('https://www.transfermarkt.es/', '_blank')
  }

  // Función para programar una transferencia
  const scheduleTransfer = (player: Player, newClub: string, transferFee: number, date: string) => {
    const newTransfer: ScheduledTransfer = {
      playerId: players.indexOf(player),
      playerName: player.name,
      fromClub: player.club,
      toClub: newClub,
      transferFee,
      date,
      status: 'pending'
    }
    setScheduledTransfers(prev => [...prev, newTransfer])
  }

  // Función para manejar la selección de jugadores para comparar
  const togglePlayerComparison = (player: Player) => {
    setComparison(prev => {
      const isSelected = prev.players.some(p => p.name === player.name)
      if (isSelected) {
        return {
          ...prev,
          players: prev.players.filter(p => p.name !== player.name)
        }
      }
      if (prev.players.length < 3) {
        return {
          ...prev,
          players: [...prev.players, player]
        }
      }
      return prev
    })
  }

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    const playerIndex = players.findIndex(p => p.name === updatedPlayer.name)
    if (playerIndex !== -1) {
      const newPlayers = [...players]
      newPlayers[playerIndex] = updatedPlayer
      setPlayers(newPlayers)
      toast.success('Player updated successfully!')
    }
  }

  // Modificar la función para obtener estadísticas
  const getPlayerStats = (player: Player): RandomStats => {
    if (!playerStats[player.name]) {
      const newStats = generateRandomStats(player.position)
      setPlayerStats(prev => ({
        ...prev,
        [player.name]: newStats
      }))
      return newStats
    }
    return playerStats[player.name]
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      {/* Header */}
      <nav className={`${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  FM
                </div>
                <span className={`text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                  Football Manager Pro
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-blue-600'
                } transition-colors duration-200`}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-blue-600'
                } transition-colors duration-200`}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
              <button
                onClick={fetchPlayers}
                className={`${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-blue-600'
                } transition-colors duration-200`}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={openTransfermarkt}
                className={`${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-blue-600'
                } transition-colors duration-200 relative group`}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Market Values
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Botones de funcionalidades adicionales */}
        <div className="flex justify-end space-x-4 mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
              darkMode 
                ? 'text-blue-400 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                : 'text-blue-600 bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
            } border-2 rounded-lg shadow-sm transition duration-150 ease-in-out`}
          >
            <ChartBarSquareIcon className="h-5 w-5 mr-2" />
            Compare Players
          </button>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
              darkMode 
                ? 'text-blue-400 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                : 'text-blue-600 bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
            } border-2 rounded-lg shadow-sm transition duration-150 ease-in-out`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Transfer History
          </button>
        </div>

        {/* Add Player Form */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
        } rounded-xl p-8 mb-8`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Add New Player</h2>
          <form onSubmit={handleAddPlayer} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="playerName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Player Name
                </label>
            <input
                  id="playerName"
              type="text"
                  placeholder="Enter player name"
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3`}
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              required
              disabled={submitting}
            />
              </div>
              <div className="space-y-2">
                <label htmlFor="position" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position
                </label>
            <select
                  id="position"
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value as Player['position'] })}
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3`}
              required
              disabled={submitting}
            >
              {Object.entries(POSITIONS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="value" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Value (M€)
                </label>
            <input
                  id="value"
              type="number"
                  placeholder="Enter player value"
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3`}
              value={newPlayer.value || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, value: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.1"
              disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Club
              </label>
              {showNewClubInput ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter new club name"
                    className={`flex-1 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3`}
                    value={newClub}
                    onChange={(e) => setNewClub(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAddClub}
                    className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out shadow-sm font-medium`}
                  >
                    Add Club
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewClubInput(false)
                      setNewClub('')
                    }}
                    className={`px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out shadow-sm font-medium`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <select
                    value={newPlayer.club}
                    onChange={(e) => setNewPlayer({ ...newPlayer, club: e.target.value })}
                    className={`flex-1 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3`}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Club</option>
                    {clubs.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewClubInput(true)}
                    className={`px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out shadow-sm font-medium`}
                  >
                    New Club
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end">
            <button
              type="submit"
                className={`px-8 py-3 text-base font-medium text-blue-600 bg-white border-2 border-blue-200 rounded-lg shadow-sm transition duration-150 ease-in-out ${
                  submitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-300 hover:bg-blue-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Player'}
            </button>
            </div>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          } shadow-lg rounded-xl p-6 mb-8`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Filter Players
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Position
                </label>
                <select
                  value={filters.position}
                  onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                >
                  <option value="">All Positions</option>
                  {Object.entries(POSITIONS).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Club
                </label>
                <input
                  type="text"
                  value={filters.club}
                  onChange={(e) => setFilters({ ...filters, club: e.target.value })}
                  placeholder="Search by club..."
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200'
                  } border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Min Value (M€)
                </label>
                <input
                  type="number"
                  value={filters.valueRange.min}
                  onChange={(e) => setFilters({
                    ...filters,
                    valueRange: { ...filters.valueRange, min: e.target.value }
                  })}
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Max Value (M€)
                </label>
                <input
                  type="number"
                  value={filters.valueRange.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    valueRange: { ...filters.valueRange, max: e.target.value }
                  })}
                  className={`w-full rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  } border-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Player Comparison Panel - Mejorado */}
        {showComparison && (
          <div className={`${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          } shadow-lg rounded-xl p-6 mb-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Player Comparison
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Click "Compare" on any player to add them here (max 3)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparison.players.length > 0 ? (
                <>
                  {comparison.players.map((player, index) => (
                    <div
                      key={player.name}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-white'
                      } relative`}
                    >
                      <button
                        onClick={() => togglePlayerComparison(player)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                          <span className="text-lg font-medium">
                            {player.name.charAt(0)}
                </span>
              </div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {player.name}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {player.club}
                          </p>
            </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Position</span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${POSITIONS[player.position].color}`}>
                            {POSITIONS[player.position].label}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Value</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {player.value}M €
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transfer History</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {transferHistory.filter(t => t.playerName === player.name).length} transfers
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Transfer</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {transferHistory.find(t => t.playerName === player.name)?.transferFee || 0}M €
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: 3 - comparison.players.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className={`p-4 rounded-lg border-2 border-dashed ${
                        darkMode 
                          ? 'border-gray-700 bg-gray-800' 
                          : 'border-gray-200 bg-gray-50'
                      } flex items-center justify-center`}
                    >
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Select a player to compare
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    No players selected for comparison
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Click the "Compare" button next to any player in the list below to start comparing
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfer History Panel */}
        {showSchedule && (
          <div className={`${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          } shadow-lg rounded-xl p-6 mb-8`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Transfer History
            </h3>
            <div className="space-y-4">
              {transferHistory.length > 0 ? (
                transferHistory.map((transfer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    } flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <p className="font-medium">{transfer.playerName}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{transfer.fromClub}</span>
                          <ArrowRightIcon className="h-4 w-4 mx-2" />
                          <span>{transfer.toClub}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-right ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <p className="font-medium">{transfer.transferFee}M €</p>
                        <p className="text-sm text-gray-500">{transfer.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    No transfer history yet
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Transfer history will appear here when players are transferred
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players List */}
        <div className={`${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50'
        } shadow-lg rounded-xl overflow-hidden`}>
          <div className={`px-8 py-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-blue-100'
          } flex justify-between items-center`}>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Players List
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearStoredData}
                className={`px-4 py-2 text-sm font-medium ${
                  darkMode 
                    ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'text-blue-600 bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                } border-2 rounded-lg shadow-sm transition duration-150 ease-in-out`}
              >
                Clear Data
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No players found. Add some players to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <table className={`min-w-full ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg overflow-hidden`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {['Name', 'Position', 'Club', 'Value (M€)', 'Actions'].map((header, index) => (
                      <th
                        key={header}
                        className={`px-6 py-4 ${header === 'Actions' ? 'text-right' : 'text-left'} text-xs font-semibold ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        } uppercase tracking-wider cursor-pointer`}
                        onClick={() => {
                          if (index < 4) {
                            const key = ['name', 'position', 'club', 'value'][index] as keyof Player
                            setSortConfig({
                              key,
                              direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            })
                          }
                        }}
                      >
                        <div className={`flex items-center ${header === 'Actions' ? 'justify-end' : 'justify-start'} space-x-1`}>
                          <span>{header}</span>
                          {index < 4 && (
                            <ArrowsUpDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {filteredPlayers.map((player, index) => (
                    <tr key={index} className={`${
                      darkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-50'
                    } transition duration-150 ${
                      comparison.players.some(p => p.name === player.name)
                        ? darkMode
                          ? 'bg-gray-700'
                          : 'bg-blue-50'
                        : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3 flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedPlayer(player)}
                              className={`text-sm font-medium ${
                                darkMode 
                                  ? 'text-gray-300 hover:text-blue-400' 
                                  : 'text-gray-900 hover:text-blue-600'
                              } transition-colors duration-150`}
                            >
                              {player.name}
                            </button>
                            {showComparison && (
                              <button
                                onClick={() => togglePlayerComparison(player)}
                                className={`text-xs px-2 py-1 rounded ${
                                  comparison.players.some(p => p.name === player.name)
                                    ? 'bg-blue-100 text-blue-800'
                                    : darkMode
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {comparison.players.some(p => p.name === player.name)
                                  ? 'Selected'
                                  : 'Compare'
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${POSITIONS[player.position].color}`}>
                          {POSITIONS[player.position].label}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {player.club}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {player.value}M €
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex justify-end items-center space-x-3">
                        <button
                          onClick={() => setTransferModalPlayer(player)}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                            darkMode 
                              ? 'text-blue-400 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                              : 'text-blue-600 bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                          } border-2 rounded-lg shadow-sm transition duration-150 ease-in-out`}
                        >
                          <ArrowsRightLeftIcon className="h-4 w-4 mr-1.5" />
                          Transfer
                        </button>
                        <button
                          onClick={() => handleDelete(player)}
                          className={`${
                            darkMode 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-900'
                          } transition-colors duration-150`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onUpdate={handleUpdatePlayer}
        />
      )}

      {transferNews && (
        <TransferNews
          player={transferNews.player}
          club={transferNews.club}
          transferMoney={transferNews.transferMoney}
          actualClub={transferNews.actualClub}
          onClose={() => setTransferNews(null)}
        />
      )}

      {transferModalPlayer && (
        <TransferModal
          player={transferModalPlayer}
          onTransfer={(newClub, transferMoney) => {
            handleTransfer(players.indexOf(transferModalPlayer), newClub, transferMoney)
            setTransferModalPlayer(null)
          }}
          onClose={() => setTransferModalPlayer(null)}
        />
      )}

      {showMarketAnalysis && (
        <MarketAnalysisPanel darkMode={darkMode} />
      )}
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App