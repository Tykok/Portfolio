import { useState } from "react";
import { useLang } from "src/context/LangContext";
import { Lang } from "src/helpers/lang";
import startWindowsLogo from 'src/images/logo/windows-start.png';

import './StartButton.scss';

const StartButton = () => {
  const langContext = useLang();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleStartButtonClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  return (
    <div className="start-button pointer" onClick={handleStartButtonClick}>
      <div className={isStartMenuOpen ? 'active' : ''}>
        <img src={startWindowsLogo} alt='start windows logo' className='start-icon' />
        <span className="start-text">{Lang.getForKey(langContext.lang, 'taskBarStart')}</span>
      </div>
    </div>
  );
}

export default StartButton;