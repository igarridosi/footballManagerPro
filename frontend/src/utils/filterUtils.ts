import { Player, FilterState } from '../interfaces/types'

export const filterPlayers = (
  players: Player[],
  filters: FilterState
): Player[] => {
  return players.filter(player => {
    // Position filter
    if (filters.position && filters.position !== 'ALL' && player.position !== filters.position) {
      return false
    }
    
    // Club filter
    if (filters.club && filters.club !== 'ALL' && player.club !== filters.club) {
      return false
    }
    
    // Value range filter
    if (filters.minValue && player.value < filters.minValue) {
      return false
    }
    if (filters.maxValue && player.value > filters.maxValue) {
      return false
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const playerNameLower = player.name.toLowerCase()
      const playerClubLower = player.club.toLowerCase()
      
      return playerNameLower.includes(searchLower) || 
             playerClubLower.includes(searchLower)
    }
    
    return true
  })
}

export const getUniqueClubs = (players: Player[]): string[] => {
  const clubs = new Set(players.map(player => player.club))
  return Array.from(clubs).sort()
}

export const getValueRange = (players: Player[]): {
  min: number
  max: number
  average: number
} => {
  if (players.length === 0) {
    return { min: 0, max: 0, average: 0 }
  }
  
  const values = players.map(player => player.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const average = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
  
  return { min, max, average }
}

export const sortPlayers = (
  players: Player[],
  sortBy: keyof Omit<Player, 'stats'> | 'rating',
  sortOrder: 'asc' | 'desc' = 'desc'
): Player[] => {
  return [...players].sort((a, b) => {
    let valueA: number | string
    let valueB: number | string
    
    if (sortBy === 'rating') {
      valueA = a.stats?.rating || 0
      valueB = b.stats?.rating || 0
    } else {
      valueA = a[sortBy] as string | number
      valueB = b[sortBy] as string | number
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    }
    
    return sortOrder === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number)
  })
}

export const getFilteredAndSortedPlayers = (
  players: Player[],
  filters: FilterState,
  sortBy: keyof Omit<Player, 'stats'> | 'rating',
  sortOrder: 'asc' | 'desc' = 'desc'
): Player[] => {
  const filteredPlayers = filterPlayers(players, filters)
  return sortPlayers(filteredPlayers, sortBy, sortOrder)
}

export const getPlayersPerPage = (
  players: Player[],
  page: number,
  pageSize: number
): Player[] => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return players.slice(start, end)
}

export const getTotalPages = (
  totalPlayers: number,
  pageSize: number
): number => {
  return Math.ceil(totalPlayers / pageSize)
}

export const validateFilters = (filters: FilterState): FilterState => {
  return {
    position: filters.position || 'ALL',
    club: filters.club || 'ALL',
    minValue: Math.max(0, filters.minValue || 0),
    maxValue: filters.maxValue || Number.MAX_SAFE_INTEGER,
    searchTerm: filters.searchTerm || ''
  }
}

export const getFilterSummary = (filters: FilterState): string => {
  const parts: string[] = []
  
  if (filters.position && filters.position !== 'ALL') {
    parts.push(`Position: ${filters.position}`)
  }
  
  if (filters.club && filters.club !== 'ALL') {
    parts.push(`Club: ${filters.club}`)
  }
  
  if (filters.minValue > 0) {
    parts.push(`Min Value: €${filters.minValue}M`)
  }
  
  if (filters.maxValue < Number.MAX_SAFE_INTEGER) {
    parts.push(`Max Value: €${filters.maxValue}M`)
  }
  
  if (filters.searchTerm) {
    parts.push(`Search: "${filters.searchTerm}"`)
  }
  
  return parts.length > 0 
    ? `Filtered by ${parts.join(', ')}`
    : 'No filters applied'
} 