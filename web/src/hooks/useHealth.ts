import { useState, useEffect, useRef } from 'react'
import type { StatusMap } from '../types'

export function useHealth() {
  const [statuses, setStatuses] = useState<StatusMap>({})
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const es = new EventSource('/api/events')
    es.addEventListener('status', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as StatusMap
        if (mounted.current) setStatuses(data)
      } catch { /* ignore malformed event */ }
    })

    return () => {
      mounted.current = false
      es.close()
    }
  }, [])

  return statuses
}
