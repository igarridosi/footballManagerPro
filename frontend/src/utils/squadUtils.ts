import { Player, Transfer, SquadStats } from '../interfaces/types'
import { getRecentTransfers, calculateTransferProfit } from './transferUtils'

export const calculateSquadStats = (
  players: Player[],
  transfers: Transfer[],
  club: string
): SquadStats => {
  const currentSquad = players.filter(player => player.club === club)
  
  // Calculate total squad value
  const totalValue = currentSquad.reduce((sum, player) => sum + player.value, 0)
  
  // Calculate value change based on transfer profit/loss
  const valueChange = calculateTransferProfit(transfers, club)
  
  // Calculate position distribution
  const positionDistribution = currentSquad.reduce((dist, player) => {
    dist[player.position] = (dist[player.position] || 0) + 1
    return dist
  }, {} as { [key: string]: number })
  
  // Get recent transfers
  const recentTransfers = getRecentTransfers(transfers, 3)
  
  // Calculate squad performance stats
  const performance = currentSquad.reduce((stats, player) => {
    if (player.stats) {
      stats.totalGoals += player.stats.goals || 0
      stats.totalAssists += player.stats.assists || 0
      stats.averageRating += player.stats.rating
      if (player.position === 'GK' && player.stats.cleanSheets) {
        stats.cleanSheets += player.stats.cleanSheets
      }
      stats.passAccuracy += player.stats.passAccuracy
    }
    return stats
  }, {
    totalGoals: 0,
    totalAssists: 0,
    averageRating: 0,
    cleanSheets: 0,
    passAccuracy: 0
  })
  
  // Calculate averages
  if (currentSquad.length > 0) {
    performance.averageRating = Number((performance.averageRating / currentSquad.length).toFixed(1))
    performance.passAccuracy = Number((performance.passAccuracy / currentSquad.length).toFixed(1))
  }
  
  return {
    totalValue,
    valueChange,
    positionDistribution,
    recentTransfers,
    performance
  }
}

export const getSquadAgeProfile = (players: Player[]): { 
  average: number
  distribution: { [key: string]: number }
} => {
  const ageGroups = {
    'Under 21': 0,
    '21-25': 0,
    '26-30': 0,
    'Over 30': 0
  }
  
  let totalAge = 0
  players.forEach(player => {
    if (player.stats?.personalInfo.age) {
      const age = player.stats.personalInfo.age
      totalAge += age
      
      if (age < 21) ageGroups['Under 21']++
      else if (age <= 25) ageGroups['21-25']++
      else if (age <= 30) ageGroups['26-30']++
      else ageGroups['Over 30']++
    }
  })
  
  return {
    average: players.length ? Number((totalAge / players.length).toFixed(1)) : 0,
    distribution: ageGroups
  }
}

export const getSquadValueTrend = (
  players: Player[],
  transfers: Transfer[],
  months: number = 12
): { date: string; value: number }[] => {
  const today = new Date()
  const trend: { date: string; value: number }[] = []
  
  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const dateStr = date.toISOString().split('T')[0]
    
    // Calculate squad value at this point in time
    const squadValue = players.reduce((total, player) => {
      const relevantTransfers = transfers.filter(t => 
        t.playerId === player.id && 
        new Date(t.date) <= date
      )
      
      if (relevantTransfers.length > 0) {
        // Use the most recent transfer value before this date
        return total + relevantTransfers[0].fee
      }
      
      // If no transfers, use current value
      return total + player.value
    }, 0)
    
    trend.unshift({ date: dateStr, value: squadValue })
  }
  
  return trend
}

export const getTopPerformers = (players: Player[], limit: number = 5): Player[] => {
  return [...players]
    .filter(player => player.stats)
    .sort((a, b) => {
      if (!a.stats || !b.stats) return 0
      return b.stats.rating - a.stats.rating
    })
    .slice(0, limit)
}

export const calculateSquadBalance = (players: Player[]): {
  status: 'Balanced' | 'Unbalanced'
  issues: string[]
} => {
  const positions = {
    GK: 0,
    DF: 0,
    CM: 0,
    FW: 0
  }
  
  players.forEach(player => {
    positions[player.position]++
  })
  
  const issues: string[] = []
  
  // Check goalkeeper balance
  if (positions.GK < 2) {
    issues.push('Insufficient goalkeepers (minimum 2 required)')
  }
  
  // Check defenders balance
  if (positions.DF < 6) {
    issues.push('Insufficient defenders (minimum 6 required)')
  }
  
  // Check midfielders balance
  if (positions.CM < 6) {
    issues.push('Insufficient midfielders (minimum 6 required)')
  }
  
  // Check forwards balance
  if (positions.FW < 4) {
    issues.push('Insufficient forwards (minimum 4 required)')
  }
  
  return {
    status: issues.length === 0 ? 'Balanced' : 'Unbalanced',
    issues
  }
}

export const getSquadDepth = (players: Player[]): {
  [key in Player['position']]: {
    starters: Player[]
    backups: Player[]
  }
} => {
  type SquadDepth = {
    [key in Player['position']]: {
      starters: Player[]
      backups: Player[]
    }
  }

  const squad: SquadDepth = {
    GK: { starters: [], backups: [] },
    DF: { starters: [], backups: [] },
    CM: { starters: [], backups: [] },
    FW: { starters: [], backups: [] }
  }
  
  // Sort players by rating in each position
  const positions: Array<Player['position']> = ['GK', 'DF', 'CM', 'FW']
  positions.forEach(position => {
    const positionPlayers = players
      .filter(p => p.position === position)
      .sort((a, b) => {
        const ratingA = a.stats?.rating || 0
        const ratingB = b.stats?.rating || 0
        return ratingB - ratingA
      })
    
    // Determine starters and backups based on position
    const starterCount = position === 'GK' ? 1 : position === 'FW' ? 3 : 4
    
    squad[position].starters = positionPlayers.slice(0, starterCount)
    squad[position].backups = positionPlayers.slice(starterCount)
  })
  
  return squad
} 