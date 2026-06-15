import { useState, useEffect, useRef } from 'react'
import type { StatusMap } from '../types'

export function useHealth(intervalMs: number = 30000) {
  const [statuses, setStatuses] = useState<StatusMap>({})
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const poll = () => {
      fetch('/api/status')
        .then((res) => res.json())
        .then((data: StatusMap) => {
          if (mounted.current) setStatuses(data)
        })
        .catch(() => { /* backend might not be ready yet */ })
    }

    poll()
    const timer = setInterval(poll, intervalMs)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [intervalMs])

  return statuses
}
