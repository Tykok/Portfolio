import type { ReactNode } from 'react';

import type { IconKind } from 'types/app';
import { useLang } from 'context/LangContext';
import { AppIcon } from '../../AppIcon/AppIcon';

interface Props {
  icon: IconKind;
  title: string;
  isMax: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDblClick?: (e: React.MouseEvent) => void;
  onMin: () => void;
  onMax: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export function TitleBar({ icon, title, isMax, onMouseDown, onDblClick, onMin, onMax, onClose }: Props) {
  const { t } = useLang();

  return (
    <div className="tq-titlebar os-tb-drag" onMouseDown={onMouseDown} onDoubleClick={onDblClick}>
      <span className="tq-tb-ico">
        <AppIcon kind={icon} size={14} />
      </span>
      <span className="tq-tb-title">{title}</span>
      <span className="tq-tb-btns">
        <button className="tq-tb-btn os-tb-btn-real" title={String(t('w_min'))} onMouseDown={(e) => e.stopPropagation()} onClick={onMin}>
          <span className="gl">_</span>
        </button>
        <button className="tq-tb-btn os-tb-btn-real" title={String(t('w_max'))} onMouseDown={(e) => e.stopPropagation()} onClick={onMax}>
          {isMax ? '❐' : '▢'}
        </button>
        <button className="tq-tb-btn is-close os-tb-btn-real" title={String(t('w_close'))} onMouseDown={(e) => e.stopPropagation()} onClick={onClose}>
          ✕
        </button>
      </span>
    </div>
  );
}
