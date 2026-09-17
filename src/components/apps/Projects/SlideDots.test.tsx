import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { SlideDots } from './SlideDots';

const mk = (id: string, title: string): DeckEntry => ({
  kind: 'personal',
  project: {
    id,
    emoji: '',
    monogram: id.toUpperCase(),
    accent: '#000',
    gradient: 'linear-gradient(135deg,#111,#222)',
    title: { fr: title, en: title },
    year: '2024',
    status: { label: { fr: 'x', en: 'x' }, type: 'live' },
    stack: [],
    desc: { fr: 'd', en: 'd' },
    bullets: { fr: [], en: [] },
    repo: '#',
    demo: '#',
  },
});

const entries = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];

const renderDots = (activeIndex: number, onSelect = vi.fn()) => {
  localStorage.setItem('ticoq.lang', 'en');
  const utils = render(
    <LangProvider>
      <SlideDots entries={entries} activeIndex={activeIndex} onSelect={onSelect} />
    </LangProvider>,
  );
  return { ...utils, onSelect };
};

it('renders one dot per entry, labelled by its slide', () => {
  renderDots(0);
  expect(screen.getAllByRole('button')).toHaveLength(entries.length);
  expect(screen.getByRole('button', { name: 'Beta' })).toBeInTheDocument();
});

it('marks the active dot, and only it', () => {
  renderDots(1);
  const current = screen.getAllByRole('button').filter((dot) => dot.getAttribute('aria-current') === 'true');
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveAccessibleName('Beta');
});

it('clicking a dot selects that slide', () => {
  const { onSelect } = renderDots(0);
  fireEvent.click(screen.getByRole('button', { name: 'Gamma' }));
  expect(onSelect).toHaveBeenCalledWith(2);
});
