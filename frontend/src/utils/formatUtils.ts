export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const formatShortDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(1)}K`
  }
  return `€${value.toFixed(2)}`
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-GB').format(value)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) {
    return `${remainingMinutes}m`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

export const formatAge = (birthDate: string | Date): string => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return `${age} years`
}

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 60) {
    return 'just now'
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}d ago`
  }
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return `${weeks}w ago`
  }
  
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}mo ago`
  }
  
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

export const formatContractStatus = (
  startDate: string | Date,
  endDate: string | Date
): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  
  if (now < start) {
    return 'Not started'
  }
  
  if (now > end) {
    return 'Expired'
  }
  
  const monthsLeft = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  
  if (monthsLeft <= 6) {
    return `${monthsLeft} months left`
  }
  
  const yearsLeft = Math.floor(monthsLeft / 12)
  const remainingMonths = monthsLeft % 12
  
  if (remainingMonths === 0) {
    return `${yearsLeft}y left`
  }
  
  return `${yearsLeft}y ${remainingMonths}m left`
}

export const formatShirtNumber = (number: string): string => {
  return number.startsWith('#') ? number : `#${number}`
}

export const formatHeight = (height: string): string => {
  if (height.endsWith('cm')) {
    const cm = parseInt(height)
    const feet = Math.floor(cm / 30.48)
    const inches = Math.round((cm / 2.54) % 12)
    return `${feet}'${inches}" (${cm}cm)`
  }
  return height
}

export const formatWeight = (weight: string): string => {
  if (weight.endsWith('kg')) {
    const kg = parseInt(weight)
    const lbs = Math.round(kg * 2.20462)
    return `${kg}kg (${lbs}lbs)`
  }
  return weight
}

export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}

export const formatStatValue = (
  value: number,
  type: 'goals' | 'assists' | 'matches' | 'minutes' | 'tackles' | 'interceptions' | 'cleanSheets'
): string => {
  switch (type) {
    case 'minutes':
      return formatDuration(value)
    case 'matches':
    case 'goals':
    case 'assists':
    case 'tackles':
    case 'interceptions':
    case 'cleanSheets':
      return formatNumber(value)
    default:
      return value.toString()
  }
}

export const formatPositionName = (position: string): string => {
  const positions: { [key: string]: string } = {
    GK: 'Goalkeeper',
    DF: 'Defender',
    CM: 'Midfielder',
    FW: 'Forward'
  }
  return positions[position] || position
}

export const formatTransferType = (fee: number): string => {
  if (fee === 0) return 'Free Transfer'
  if (fee < 0) return 'Loan'
  return 'Transfer'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
} 