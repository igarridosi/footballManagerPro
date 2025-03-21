import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { PlusIcon, ArrowPathIcon, TrashIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

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

const API_URL = import.meta.env.PROD 
  ? 'https://football-manager-ejmb55h27-igarridosis-projects.vercel.app/api' 
  : 'http://localhost:8000'

// Configure axios defaults with CORS settings
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'
delete axios.defaults.headers.common['Origin']  // Remove Origin header

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

function PlayerProfileModal({ player, onClose }: { player: Player, onClose: () => void }) {
  const [profileData, setProfileData] = useState<Partial<PlayerProfile>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlayerDetails = async () => {
      setLoading(true)
      const details = await fetchPlayerDetails(player.name)
      setProfileData(details)
      setLoading(false)
    }

    loadPlayerDetails()
  }, [player.name])

  const profile: PlayerProfile = {
    ...player,
    appearances: profileData.appearances || 0,
    starts: profileData.starts || 0,
    minutesPlayed: profileData.minutesPlayed || 0,
    goals: profileData.goals || 0,
    yellowCards: profileData.yellowCards || 0,
    redCards: profileData.redCards || 0,
    number: profileData.number || "#N/A",
    dateOfBirth: profileData.dateOfBirth || "Unknown",
    placeOfBirth: profileData.placeOfBirth || "Unknown",
    nationality: profileData.nationality || "Unknown",
    height: profileData.height || "Unknown",
    weight: profileData.weight || "Unknown",
    preferredSide: profileData.preferredSide || "Unknown",
    dateSigned: "N/A", // These would need to come from your backend
    contractEnds: "N/A"  // These would need to come from your backend
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1C1C1C] text-white rounded-lg w-full max-w-4xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-bold">{profile.name}</h2>
              <div className="text-2xl text-gray-400 mt-2">{profile.number}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.appearances}</div>
                    <div className="text-gray-400">Appearances</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.goals}</div>
                    <div className="text-gray-400">Goals</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.starts}</div>
                    <div className="text-gray-400">Starts</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.yellowCards}</div>
                    <div className="text-gray-400">Yellow Cards</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.minutesPlayed}</div>
                    <div className="text-gray-400">Minutes Played</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">{profile.redCards}</div>
                    <div className="text-gray-400">Red Cards</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className={`px-2 py-0.5 rounded-full text-sm ${POSITIONS[profile.position].color}`}>
                    {POSITIONS[profile.position].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date of birth:</span>
                  <span>{profile.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Place of birth:</span>
                  <span>{profile.placeOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nationality:</span>
                  <span>{profile.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Height:</span>
                  <span>{profile.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span>{profile.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred Side:</span>
                  <span>{profile.preferredSide}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date signed:</span>
                  <span>{profile.dateSigned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Ends:</span>
                  <span>{profile.contractEnds}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: '',
    position: 'GK',
    club: '',
    value: 0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load saved players from localStorage on initial render
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEY)
    if (savedPlayers) {
      try {
        // Validate and fix positions of saved players
        const parsedPlayers = JSON.parse(savedPlayers)
        const validatedPlayers = parsedPlayers.map(validatePlayer)
        setPlayers(validatedPlayers)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing saved players:', error)
        localStorage.removeItem(STORAGE_KEY) // Clear invalid data
        fetchPlayers()
      }
    } else {
      fetchPlayers()
    }
  }, [])

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
    }
  }, [players, loading])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/players')
      // Validate and fix positions of fetched players
      const validatedPlayers = response.data.map(validatePlayer)
      setPlayers(validatedPlayers)
      // Save validated players to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedPlayers))
    } catch (error: any) {
      console.error('Error fetching players:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch players'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
      const response = await axios.put(`/players/${index}/transfer`, null, {
        params: { new_club: newClub.trim(), transfer_money: transferMoney }
      })
      toast.success('Transfer completed successfully!')
      const updatedPlayers = [...players]
      updatedPlayers[index] = response.data
      setPlayers(updatedPlayers)
      // localStorage is automatically updated due to the useEffect
    } catch (error: any) {
      console.error('Error transferring player:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Transfer failed'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (index: number) => {
    try {
      await axios.delete(`/players/${index}`)
      toast.success('Player removed successfully!')
      const updatedPlayers = players.filter((_, i) => i !== index)
      setPlayers(updatedPlayers)
      // localStorage is automatically updated due to the useEffect
    } catch (error: any) {
      console.error('Error deleting player:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to remove player'
      toast.error(errorMessage)
    }
  }

  const clearStoredData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY)
      fetchPlayers() // Reload data from server
      toast.success('Local storage cleared successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-semibold text-gray-900">Football Manager Pro</span>
                <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {players.length} Players
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchPlayers}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <BellIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <UserCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add Player Form */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Player</h2>
          <form onSubmit={handleAddPlayer} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Player Name"
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              required
              disabled={submitting}
            />
            <select
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value as Player['position'] })}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              required
              disabled={submitting}
            >
              {Object.entries(POSITIONS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Club"
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              value={newPlayer.club}
              onChange={(e) => setNewPlayer({ ...newPlayer, club: e.target.value })}
              required
              disabled={submitting}
            />
            <input
              type="number"
              placeholder="Value (M€)"
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              value={newPlayer.value || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, value: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.1"
              disabled={submitting}
            />
            <button
              type="submit"
              className={`inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={submitting}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {submitting ? 'Adding...' : 'Add Player'}
            </button>
          </form>
        </div>

        {/* Players List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Players List</h3>
              <div className="ml-2 flex items-center text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {players.length} total
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearStoredData}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Data
              </button>
              <button
                onClick={fetchPlayers}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (M€)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <button
                              onClick={() => setSelectedPlayer(player)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {player.name}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${POSITIONS[player.position].color}`}>
                          {POSITIONS[player.position].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.club}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{player.value}M €</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            const newClub = prompt('Enter new club:')
                            const transferMoney = parseFloat(prompt('Enter transfer fee (M€):') || '0')
                            if (newClub && !isNaN(transferMoney)) {
                              handleTransfer(index, newClub, transferMoney)
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-900"
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
        />
      )}
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App