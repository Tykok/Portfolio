import React, { useState } from 'react'
import { useLang } from 'src/context/LangContext'

import './LangSwitcher.scss'

const LangSwitcher: React.FC = () => {
  const { lang, setLang } = useLang()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleChangeLang = (newLang: string) => {
    setLang(newLang)
    setIsOpen(false)
  }

  return (
    <div className="language">
      <button className="language-button" onClick={toggleDropdown}>
        {lang.toUpperCase()}
      </button>
      {isOpen && (
        <ul className="language-dropdown">
          <li onClick={() => handleChangeLang('en')}>EN</li>
          <li onClick={() => handleChangeLang('fr')}>FR</li>
        </ul>
      )}
    </div>
  )
}

export default LangSwitcher
