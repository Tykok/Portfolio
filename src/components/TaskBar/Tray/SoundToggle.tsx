import { useLang } from 'context/LangContext';
import { useSound } from 'context/SoundContext';

/**
 * The tray speaker. `data-sound="none"` because muting that ticks on its way
 * out is a joke that stops being funny the first time someone uses it.
 */
export function SoundToggle() {
  const { t } = useLang();
  const { enabled, toggle } = useSound();
  const label = enabled ? t('sound_on') : t('sound_off');

  return (
    <button
      type="button"
      className={`os-soundsw${enabled ? ' on' : ''}`}
      data-sound="none"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={enabled}
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
    </button>
  );
}

export default SoundToggle;
