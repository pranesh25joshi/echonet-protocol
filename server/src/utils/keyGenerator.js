import { nanoid, customAlphabet } from 'nanoid'

/**
 * Generate a unique room access key
 * Format: XXXX-XXXX-XXXX (alphanumeric, uppercase)
 */
export const generateRoomKey = () => {
  const nanoidCustom = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4)
  return `${nanoidCustom()}-${nanoidCustom()}-${nanoidCustom()}`
}

/**
 * Generate a unique user ID
 */
export const generateUserId = () => {
  return `user_${nanoid(12)}`
}

/**
 * Validate room key format
 */
export const isValidRoomKey = (key) => {
  const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return regex.test(key)
}
