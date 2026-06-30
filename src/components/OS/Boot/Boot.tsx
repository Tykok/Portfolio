import { useLang } from 'context/LangContext';

interface Props {
  onDone: () => void;
}

export function Boot({ onDone }: Props) {
  const { t } = useLang();

  return (
    <div className="os-boot" onClick={onDone}>
      <div className="os-boot-logo">
        Ticoq<b>OS</b>
      </div>
      <div className="os-boot-sub">Backend Edition</div>
      <div className="os-bootbar">
        <i />
      </div>
      <div className="os-boot-foot">{t('boot_foot')}</div>
    </div>
  );
}
