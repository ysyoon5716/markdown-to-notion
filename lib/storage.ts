/**
 * Safe localStorage utilities for client-side storage
 * Handles SSR scenarios where localStorage is not available
 */

const NOTION_API_KEY = "notion_api_key"

/**
 * Check if localStorage is available (client-side only)
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage !== undefined
  } catch {
    return false
  }
}

/**
 * Get the cached Notion API key from localStorage
 */
export function getNotionApiKey(): string | null {
  if (!isLocalStorageAvailable()) return null

  try {
    return localStorage.getItem(NOTION_API_KEY)
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return null
  }
}

/**
 * Save the Notion API key to localStorage
 */
export function setNotionApiKey(apiKey: string): void {
  if (!isLocalStorageAvailable()) return

  try {
    localStorage.setItem(NOTION_API_KEY, apiKey)
  } catch (error) {
    console.error("Error writing to localStorage:", error)
  }
}

/**
 * Remove the Notion API key from localStorage
 */
export function removeNotionApiKey(): void {
  if (!isLocalStorageAvailable()) return

  try {
    localStorage.removeItem(NOTION_API_KEY)
  } catch (error) {
    console.error("Error removing from localStorage:", error)
  }
}
