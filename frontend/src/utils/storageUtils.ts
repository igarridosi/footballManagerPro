import { Player, Transfer } from '../interfaces/types'
import { STORAGE_KEY } from '../constants'

interface StoredData {
  players: Player[]
  transfers: Transfer[]
  lastUpdated: string
}

export const saveToLocalStorage = (data: StoredData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const loadFromLocalStorage = (): StoredData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    
    const parsedData = JSON.parse(data)
    if (!isValidStoredData(parsedData)) {
      console.error('Invalid data structure in localStorage')
      return null
    }
    
    return parsedData
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

export const updateLocalStorage = (
  key: keyof StoredData,
  value: StoredData[keyof StoredData]
): void => {
  try {
    const data = loadFromLocalStorage()
    if (!data) return
    
    const updatedData = {
      ...data,
      [key]: value,
      lastUpdated: new Date().toISOString()
    }
    
    saveToLocalStorage(updatedData)
  } catch (error) {
    console.error('Error updating localStorage:', error)
  }
}

export const isDataStale = (lastUpdated: string, staleThreshold: number = 24): boolean => {
  const lastUpdate = new Date(lastUpdated)
  const now = new Date()
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceUpdate > staleThreshold
}

const isValidStoredData = (data: any): data is StoredData => {
  if (!data || typeof data !== 'object') return false
  
  // Check if all required properties exist
  if (!('players' in data && 'transfers' in data && 'lastUpdated' in data)) {
    return false
  }
  
  // Check if players is an array of Player objects
  if (!Array.isArray(data.players)) return false
  if (!data.players.every(isValidPlayer)) return false
  
  // Check if transfers is an array of Transfer objects
  if (!Array.isArray(data.transfers)) return false
  if (!data.transfers.every(isValidTransfer)) return false
  
  // Check if lastUpdated is a valid date string
  if (typeof data.lastUpdated !== 'string' || isNaN(Date.parse(data.lastUpdated))) {
    return false
  }
  
  return true
}

const isValidPlayer = (player: any): player is Player => {
  if (!player || typeof player !== 'object') return false
  
  const requiredProps = ['id', 'name', 'position', 'club', 'value']
  return requiredProps.every(prop => prop in player) &&
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    ['GK', 'DF', 'CM', 'FW'].includes(player.position) &&
    typeof player.club === 'string' &&
    typeof player.value === 'number'
}

const isValidTransfer = (transfer: any): transfer is Transfer => {
  if (!transfer || typeof transfer !== 'object') return false
  
  const requiredProps = ['id', 'playerId', 'playerName', 'fromClub', 'toClub', 'fee', 'date']
  return requiredProps.every(prop => prop in transfer) &&
    typeof transfer.id === 'string' &&
    typeof transfer.playerId === 'string' &&
    typeof transfer.playerName === 'string' &&
    typeof transfer.fromClub === 'string' &&
    typeof transfer.toClub === 'string' &&
    typeof transfer.fee === 'number' &&
    typeof transfer.date === 'string' &&
    !isNaN(Date.parse(transfer.date))
}

export const exportData = (): string => {
  const data = loadFromLocalStorage()
  if (!data) return ''
  
  return JSON.stringify(data, null, 2)
}

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData)
    if (!isValidStoredData(data)) {
      console.error('Invalid data structure in import file')
      return false
    }
    
    saveToLocalStorage(data)
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

export const backupData = (): void => {
  const data = exportData()
  if (!data) return
  
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `football_manager_backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const getStorageStats = (): {
  totalSize: number
  playerCount: number
  transferCount: number
  lastBackup: string | null
} => {
  const data = loadFromLocalStorage()
  if (!data) {
    return {
      totalSize: 0,
      playerCount: 0,
      transferCount: 0,
      lastBackup: null
    }
  }
  
  const storageSize = new Blob([JSON.stringify(data)]).size
  
  return {
    totalSize: storageSize,
    playerCount: data.players.length,
    transferCount: data.transfers.length,
    lastBackup: data.lastUpdated
  }
} 