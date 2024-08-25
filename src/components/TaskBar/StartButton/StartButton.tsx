import { useState } from "react";

import startWindowsLogo from '../../../images/logo/windows-start.png';

import './StartButton.scss';

const StartButton = () => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleStartButtonClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  return (
    <div className="start-button pointer" onClick={handleStartButtonClick}>
      <div className={isStartMenuOpen ? 'active' : ''}>
        <img src={startWindowsLogo} alt='start windows logo' className='start-icon' />
        <span className="start-text">Démarrer</span>
      </div>
    </div>
  );
}

export default StartButton;