import { Player, Transfer } from '../interfaces/types'
import { v4 as uuidv4 } from 'uuid'

export const validateTransfer = (
  player: Player,
  toClub: string,
  fee: number
): { isValid: boolean; message?: string } => {
  if (!player) {
    return { isValid: false, message: 'Player not found' }
  }

  if (player.club === toClub) {
    return { isValid: false, message: 'Cannot transfer to the same club' }
  }

  if (fee < 0) {
    return { isValid: false, message: 'Transfer fee cannot be negative' }
  }

  return { isValid: true }
}

export const createTransfer = (
  player: Player,
  toClub: string,
  fee: number
): Transfer => {
  return {
    id: uuidv4(),
    playerId: player.id,
    playerName: player.name,
    fromClub: player.club,
    toClub,
    fee,
    date: new Date().toISOString().split('T')[0]
  }
}

export const updatePlayerAfterTransfer = (
  player: Player,
  toClub: string,
  fee: number
): Player => {
  return {
    ...player,
    club: toClub,
    value: Math.max(fee, player.value) // Update value if transfer fee is higher
  }
}

export const formatTransferFee = (fee: number): string => {
  if (fee >= 1000000) {
    return `€${(fee / 1000000).toFixed(1)}M`
  } else if (fee >= 1000) {
    return `€${(fee / 1000).toFixed(1)}K`
  }
  return `€${fee.toFixed(2)}`
}

export const getTransferHistory = (transfers: Transfer[]): Transfer[] => {
  return [...transfers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getPlayerTransferHistory = (
  transfers: Transfer[],
  playerId: string
): Transfer[] => {
  return transfers.filter(transfer => transfer.playerId === playerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const calculateTransferProfit = (
  transfers: Transfer[],
  club: string
): number => {
  return transfers.reduce((profit, transfer) => {
    if (transfer.toClub === club) {
      return profit - transfer.fee // Money spent
    }
    if (transfer.fromClub === club) {
      return profit + transfer.fee // Money earned
    }
    return profit
  }, 0)
}

export const getRecentTransfers = (
  transfers: Transfer[],
  limit: number = 5
): Transfer[] => {
  return [...transfers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export const getTransfersByClub = (
  transfers: Transfer[],
  club: string
): Transfer[] => {
  return transfers.filter(
    transfer => transfer.fromClub === club || transfer.toClub === club
  )
}

export const getTransfersByDate = (
  transfers: Transfer[],
  startDate: string,
  endDate: string
): Transfer[] => {
  return transfers.filter(transfer => {
    const transferDate = new Date(transfer.date)
    return (
      transferDate >= new Date(startDate) &&
      transferDate <= new Date(endDate)
    )
  })
}

export const calculateMarketValue = (
  player: Player,
  transfers: Transfer[]
): number => {
  const playerTransfers = getPlayerTransferHistory(transfers, player.id)
  if (playerTransfers.length === 0) {
    return player.value
  }

  const lastTransfer = playerTransfers[0]
  const monthsSinceTransfer = Math.floor(
    (new Date().getTime() - new Date(lastTransfer.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  // Adjust value based on time since last transfer
  let adjustedValue = lastTransfer.fee
  if (monthsSinceTransfer <= 6) {
    adjustedValue *= 1.1 // Recent transfer, slight increase
  } else if (monthsSinceTransfer <= 12) {
    adjustedValue *= 1.05 // Moderate time since transfer
  } else if (monthsSinceTransfer > 24) {
    adjustedValue *= 0.95 // Long time since transfer
  }

  // Consider player's stats if available
  if (player.stats) {
    const { rating, matchesPlayed } = player.stats
    if (rating > 8) adjustedValue *= 1.2
    else if (rating > 7) adjustedValue *= 1.1
    if (matchesPlayed > 200) adjustedValue *= 1.1
  }

  return Math.round(adjustedValue)
} 