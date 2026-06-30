import { useLang } from 'context/LangContext';

interface Props {
  onRestart: () => void;
}

export function Off({ onRestart }: Props) {
  const { t } = useLang();

  return (
    <div
      className="os-boot"
      style={{ background: '#000', cursor: 'pointer' }}
      onClick={onRestart}
    >
      <div className="os-boot-logo" style={{ fontSize: 36 }}>{t('off_title')}</div>
      <div className="os-boot-sub">{t('off_sub')}</div>
    </div>
  );
}
