import type { ReactNode } from 'react';

import { useLang } from 'context/LangContext';
import type { IconKind } from 'types/app';

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
      {/* min and close carry data-sound="none": WindowContext already sounds
          those two, and the generic click tick would double up on them. */}
      {/* The glyphs are decorative: `_`, `▢` and `✕` read as nothing useful to a
          screen reader, so each button carries its label explicitly. */}
      <span className="tq-tb-btns">
        <button
          className="tq-tb-btn os-tb-btn-real"
          data-sound="none"
          title={t('w_min')}
          aria-label={`${t('w_min')} — ${title}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onMin}
        >
          <span className="gl" aria-hidden="true">
            _
          </span>
        </button>
        <button
          className="tq-tb-btn os-tb-btn-real"
          title={t('w_max')}
          aria-label={`${t('w_max')} — ${title}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onMax}
        >
          <span aria-hidden="true">{isMax ? '❐' : '▢'}</span>
        </button>
        <button
          className="tq-tb-btn is-close os-tb-btn-real"
          data-sound="none"
          title={t('w_close')}
          aria-label={`${t('w_close')} — ${title}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </span>
    </div>
  );
}
