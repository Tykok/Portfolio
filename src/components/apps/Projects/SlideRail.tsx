import { Fragment } from 'react';

import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';
import { toRailItem } from 'data/deck';

interface SlideRailProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function SlideRail({ entries, activeIndex, onSelect }: SlideRailProps) {
  const { lang, t } = useLang();

  /* Indices are global across both groups: the stage's counter and its arrow
     keys run over the whole list, so a thumbnail must report where it sits in
     that list, not where it sits in its group. */
  const numbered = entries.map((entry, index) => ({ entry, index }));
  const groups = [
    { key: 'personal', label: t('p_group_personal'), items: numbered.filter(({ entry }) => entry.kind === 'personal') },
    { key: 'company', label: t('p_group_company'), items: numbered.filter(({ entry }) => entry.kind === 'company') },
  ].filter((group) => group.items.length > 0);

  return (
    <nav className="deck-rail" aria-label={t('p_rail')}>
      {groups.map((group) => (
        <Fragment key={group.key}>
          <div className="hd">
            {group.label} ({group.items.length})
          </div>
          {group.items.map(({ entry, index }) => {
            const item = toRailItem(entry, lang);
            return (
              <button
                key={item.id}
                type="button"
                className={`deck-thumb${index === activeIndex ? ' on' : ''}`}
                onClick={() => onSelect(index)}
                aria-label={item.label}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <span className="deck-thumb-n">{index + 1}</span>
                <span className="deck-thumb-ico" style={{ background: item.gradient }}>
                  {item.monogram}
                </span>
                <span className="deck-thumb-t">{item.label}</span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </nav>
  );
}
