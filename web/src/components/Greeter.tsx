import { useState, useEffect } from 'react'

interface Props {
  greeting: string
}

export function Greeter({ greeting }: Props) {
  const [time, setTime] = useState(getTime)

  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 mb-8 md:mb-10">
      <div>
        <h1 className="design-heading-lg mb-1">
          {time}
        </h1>
        <p className="design-heading-md text-(--color-on-surface-variant)">
          {greeting}
        </p>
      </div>
      <div className="hidden md:block">
        <span className="design-label text-(--color-outline)">
          Internal Network: Online
        </span>
      </div>
    </section>
  )
}

function getTime(): string {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}
