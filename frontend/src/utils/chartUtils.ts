import { Player, Transfer } from '../interfaces/types'
import { formatCurrency, formatPercentage } from './formatUtils'

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

export const getPositionDistributionData = (players: Player[]): ChartData => {
  const positions: {
    [K in Player['position']]: { count: number; color: string }
  } = {
    GK: { count: 0, color: '#FF6384' },
    DF: { count: 0, color: '#36A2EB' },
    CM: { count: 0, color: '#FFCE56' },
    FW: { count: 0, color: '#4BC0C0' }
  }
  
  players.forEach(player => {
    positions[player.position].count++
  })
  
  return {
    labels: Object.keys(positions).map(pos => `${pos} (${positions[pos as keyof typeof positions].count})`),
    datasets: [{
      label: 'Position Distribution',
      data: Object.values(positions).map(pos => pos.count),
      backgroundColor: Object.values(positions).map(pos => pos.color),
      borderWidth: 1
    }]
  }
}

export const getSquadValueTrendData = (
  transfers: Transfer[],
  months: number = 12
): ChartData => {
  const today = new Date()
  const labels: string[] = []
  const values: number[] = []
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthTransfers = transfers.filter(t => new Date(t.date) <= date)
    
    labels.push(date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }))
    values.push(monthTransfers.reduce((sum, t) => sum + t.fee, 0))
  }
  
  return {
    labels,
    datasets: [{
      label: 'Squad Value',
      data: values,
      borderColor: '#4BC0C0',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2
    }]
  }
}

export const getAgeDistributionData = (players: Player[]): ChartData => {
  const ageGroups = {
    'Under 21': 0,
    '21-25': 0,
    '26-30': 0,
    'Over 30': 0
  }
  
  players.forEach(player => {
    if (player.stats?.personalInfo.age) {
      const age = player.stats.personalInfo.age
      if (age < 21) ageGroups['Under 21']++
      else if (age <= 25) ageGroups['21-25']++
      else if (age <= 30) ageGroups['26-30']++
      else ageGroups['Over 30']++
    }
  })
  
  return {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Players',
      data: Object.values(ageGroups),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)'
      ],
      borderWidth: 1
    }]
  }
}

export const getPerformanceRadarData = (player: Player): ChartData => {
  if (!player.stats) return { labels: [], datasets: [] }
  
  const stats = player.stats
  const maxValues = {
    rating: 10,
    passAccuracy: 100,
    goals: 30,
    assists: 20,
    tackles: 100,
    interceptions: 80
  }
  
  const data = {
    rating: (stats.rating / maxValues.rating) * 100,
    passAccuracy: stats.passAccuracy,
    goals: ((stats.goals || 0) / maxValues.goals) * 100,
    assists: ((stats.assists || 0) / maxValues.assists) * 100,
    tackles: ((stats.tackles || 0) / maxValues.tackles) * 100,
    interceptions: ((stats.interceptions || 0) / maxValues.interceptions) * 100
  }
  
  return {
    labels: [
      'Rating',
      'Pass Accuracy',
      'Goals',
      'Assists',
      'Tackles',
      'Interceptions'
    ],
    datasets: [{
      label: player.name,
      data: Object.values(data),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2
    }]
  }
}

export const getTransferBalanceData = (
  transfers: Transfer[],
  club: string
): ChartData => {
  const monthlyBalance: { [key: string]: number } = {}
  
  transfers.forEach(transfer => {
    const month = new Date(transfer.date).toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit'
    })
    
    if (!monthlyBalance[month]) {
      monthlyBalance[month] = 0
    }
    
    if (transfer.fromClub === club) {
      monthlyBalance[month] += transfer.fee // Money received
    } else if (transfer.toClub === club) {
      monthlyBalance[month] -= transfer.fee // Money spent
    }
  })
  
  const sortedMonths = Object.keys(monthlyBalance).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })
  
  return {
    labels: sortedMonths,
    datasets: [{
      label: 'Transfer Balance',
      data: sortedMonths.map(month => monthlyBalance[month]),
      backgroundColor: sortedMonths.map(month => 
        monthlyBalance[month] >= 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)'
      ),
      borderColor: sortedMonths.map(month =>
        monthlyBalance[month] >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'
      ),
      borderWidth: 1
    }]
  }
}

type PlayerStatMetric = 'rating' | 'matchesPlayed' | 'minutesPlayed' | 'passAccuracy' | 'goals' | 'assists' | 'cleanSheets' | 'savePercentage' | 'tackles' | 'interceptions'

export const getPlayerComparisonData = (
  players: Player[],
  metric: PlayerStatMetric
): ChartData => {
  const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1)
  
  return {
    labels: players.map(p => p.name),
    datasets: [{
      label: metricLabel,
      data: players.map(p => p.stats?.[metric] || 0),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)'
      ],
      borderWidth: 1
    }]
  }
}

export const getSquadPerformanceData = (players: Player[]): ChartData => {
  const performanceMetrics = {
    'High Rating (>8.0)': 0,
    'Good Rating (7.0-8.0)': 0,
    'Average Rating (6.0-7.0)': 0,
    'Low Rating (<6.0)': 0
  }
  
  players.forEach(player => {
    if (player.stats?.rating) {
      const rating = player.stats.rating
      if (rating > 8) performanceMetrics['High Rating (>8.0)']++
      else if (rating > 7) performanceMetrics['Good Rating (7.0-8.0)']++
      else if (rating > 6) performanceMetrics['Average Rating (6.0-7.0)']++
      else performanceMetrics['Low Rating (<6.0)']++
    }
  })
  
  return {
    labels: Object.keys(performanceMetrics),
    datasets: [{
      label: 'Performance Distribution',
      data: Object.values(performanceMetrics),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ],
      borderWidth: 1
    }]
  }
}

export const getChartTooltipOptions = (format: 'currency' | 'percentage' | 'number') => {
  return {
    callbacks: {
      label: (context: any) => {
        let value = context.raw
        switch (format) {
          case 'currency':
            return formatCurrency(value)
          case 'percentage':
            return formatPercentage(value)
          default:
            return value.toString()
        }
      }
    }
  }
}

export const getChartColors = (count: number): string[] => {
  const baseColors = [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)'
  ]
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }
  
  // Generate additional colors if needed
  const colors = [...baseColors]
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360 // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 50%)`)
  }
  
  return colors
} 