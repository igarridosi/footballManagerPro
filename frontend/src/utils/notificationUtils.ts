import { toast } from 'react-toastify'

interface NotificationOptions {
  duration?: number
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
  type?: 'success' | 'error' | 'info' | 'warning'
}

const defaultOptions: Required<NotificationOptions> = {
  duration: 3000,
  position: 'top-right',
  type: 'info'
}

export const showNotification = (
  message: string,
  options: NotificationOptions = {}
): void => {
  const { duration, position, type } = { ...defaultOptions, ...options }
  
  toast(message, {
    position,
    autoClose: duration,
    type,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

export const showSuccessNotification = (
  message: string,
  options: Omit<NotificationOptions, 'type'> = {}
): void => {
  showNotification(message, { ...options, type: 'success' })
}

export const showErrorNotification = (
  message: string,
  options: Omit<NotificationOptions, 'type'> = {}
): void => {
  showNotification(message, { ...options, type: 'error' })
}

export const showWarningNotification = (
  message: string,
  options: Omit<NotificationOptions, 'type'> = {}
): void => {
  showNotification(message, { ...options, type: 'warning' })
}

export const showInfoNotification = (
  message: string,
  options: Omit<NotificationOptions, 'type'> = {}
): void => {
  showNotification(message, { ...options, type: 'info' })
}

export const showTransferNotification = (
  playerName: string,
  fromClub: string,
  toClub: string,
  fee: number
): void => {
  const message = `Transfer completed: ${playerName} moves from ${fromClub} to ${toClub} for €${fee}M`
  showSuccessNotification(message, { duration: 5000 })
}

export const showPlayerAddedNotification = (
  playerName: string,
  club: string
): void => {
  showSuccessNotification(
    `${playerName} has been added to ${club}`,
    { duration: 3000 }
  )
}

export const showPlayerUpdatedNotification = (
  playerName: string
): void => {
  showSuccessNotification(
    `${playerName}'s information has been updated`,
    { duration: 3000 }
  )
}

export const showPlayerDeletedNotification = (
  playerName: string
): void => {
  showInfoNotification(
    `${playerName} has been removed from the database`,
    { duration: 3000 }
  )
}

export const showDataImportNotification = (
  success: boolean,
  details?: string
): void => {
  if (success) {
    showSuccessNotification(
      'Data imported successfully',
      { duration: 3000 }
    )
  } else {
    showErrorNotification(
      `Failed to import data${details ? `: ${details}` : ''}`,
      { duration: 5000 }
    )
  }
}

export const showDataExportNotification = (
  success: boolean,
  details?: string
): void => {
  if (success) {
    showSuccessNotification(
      'Data exported successfully',
      { duration: 3000 }
    )
  } else {
    showErrorNotification(
      `Failed to export data${details ? `: ${details}` : ''}`,
      { duration: 5000 }
    )
  }
}

export const showBackupNotification = (
  success: boolean,
  details?: string
): void => {
  if (success) {
    showSuccessNotification(
      'Backup created successfully',
      { duration: 3000 }
    )
  } else {
    showErrorNotification(
      `Failed to create backup${details ? `: ${details}` : ''}`,
      { duration: 5000 }
    )
  }
}

export const showValidationErrorNotification = (
  errors: string[]
): void => {
  const message = errors.length === 1
    ? errors[0]
    : `Multiple validation errors:\n${errors.map(err => `• ${err}`).join('\n')}`
  
  showErrorNotification(message, { duration: 5000 })
}

export const showNetworkErrorNotification = (
  error: Error
): void => {
  showErrorNotification(
    `Network error: ${error.message}`,
    { duration: 5000 }
  )
}

export const showSessionExpiredNotification = (): void => {
  showWarningNotification(
    'Your session has expired. Please refresh the page.',
    { duration: 0 } // Duration 0 means it won't auto-close
  )
}

export const showMaintenanceNotification = (
  startTime: string,
  duration: number
): void => {
  showWarningNotification(
    `Scheduled maintenance will begin at ${startTime} and last approximately ${duration} minutes.`,
    { duration: 10000 }
  )
} 