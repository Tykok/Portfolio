import { useState } from 'react';

import { useOS } from 'context/OSContext';
import { useLang } from 'context/LangContext';

export function Mascot() {
  const { mascot, hideMascot, showMascot } = useOS();
  const { t } = useLang();
  const [wink, setWink] = useState(false);

  const handleCoqClick = () => {
    setWink(true);
    setTimeout(() => setWink(false), 500);
    if (!mascot.visible) {
      showMascot(String(t('t_coqsay_default')));
    } else {
      hideMascot();
    }
  };

  return (
    <div className="os-mascot">
      {mascot.visible && (
        <div className="mascot-bubble">
          {mascot.msg}
          <span className="mascot-x" onClick={hideMascot}>✕</span>
          <span className="mascot-tail" />
        </div>
      )}
      <button
        className={`mascot-coq${wink ? ' wink' : ''}`}
        onClick={handleCoqClick}
        title="Mascotte TicoqOS"
      >
        🐓
      </button>
    </div>
  );
}
