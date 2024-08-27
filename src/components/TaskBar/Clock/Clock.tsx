import React, { useEffect, useState } from 'react'

import { useLang } from '../../../context/LangContext'

import './Clock.scss'

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>('')
  const { lang } = useLang()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const formattedTime = now.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
      setTime(formattedTime)
    }

    updateClock()
    const intervalId = setInterval(updateClock, 1000) // Update every second

    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [lang])

  return <div className="clock">{time}</div>
}

export default Clock
