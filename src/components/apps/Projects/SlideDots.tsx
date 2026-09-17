import { useLang } from 'context/LangContext';
import type { DeckEntry } from 'data/deck';
import { toRailItem } from 'data/deck';

interface SlideDotsProps {
  entries: DeckEntry[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

/**
 * The rail's stand-in on a phone, where the rail is hidden so the slide can
 * have the whole screen. Same job — say where you are, let you jump anywhere —
 * in the height of a row of dots.
 */
export function SlideDots({ entries, activeIndex, onSelect }: SlideDotsProps) {
  const { lang, t } = useLang();

  return (
    <nav className="deck-dots" aria-label={t('p_dots')}>
      {entries.map((entry, index) => {
        const item = toRailItem(entry, lang);
        return (
          <button
            key={item.id}
            type="button"
            className={`deck-dot${index === activeIndex ? ' on' : ''}`}
            onClick={() => onSelect(index)}
            aria-label={item.label}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        );
      })}
    </nav>
  );
}
