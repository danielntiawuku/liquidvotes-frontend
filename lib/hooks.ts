import { useEffect } from 'react'
import { warmUpBackend } from './api'

/**
 * Fires a single silent /health ping to the backend on mount so a sleeping
 * Render free instance has time to cold-start before the page's real API
 * calls arrive. Errors are swallowed — it can never affect the UI.
 *
 * Usage: `useWarmUp()` — one line, no extra imports.
 */
export function useWarmUp() {
  useEffect(warmUpBackend, [])
}
