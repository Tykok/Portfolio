import { useState } from 'react'
import startWindowsLogo from 'images/logo/windows-start.png'

import { useLang } from 'context/LangContext'

import './StartButton.scss'

const StartButton = () => {
  const { t } = useLang()
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)

  const handleStartButtonClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen)
  }

  return (
    <div className="start pointer" onClick={handleStartButtonClick}>
      <div className={isStartMenuOpen ? 'active' : ''}>
        <img src={startWindowsLogo} alt="start windows logo" className="start-icon" />
        <span className="start-text">{t('start')}</span>
      </div>
    </div>
  )
}

export default StartButton
