import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import type { DeckEntry } from 'data/deck';

import { SlideStage } from './SlideStage';

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

const renderStage = (activeIndex: number, onSelect = vi.fn()) => {
  // Set language to English for the test
  localStorage.setItem('ticoq.lang', 'en');
  const utils = render(
    <LangProvider>
      <SlideStage entries={entries} activeIndex={activeIndex} onSelect={onSelect} />
    </LangProvider>,
  );
  return { ...utils, onSelect };
};

it('renders the active slide and the counter', () => {
  renderStage(1);
  expect(screen.getByText('Beta')).toBeInTheDocument();
  expect(screen.getByText('2 / 3')).toBeInTheDocument();
});

it('next button advances, prev button goes back', () => {
  const { onSelect } = renderStage(1);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(onSelect).toHaveBeenCalledWith(2);
  fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
  expect(onSelect).toHaveBeenCalledWith(0);
});

it('prev is disabled on first slide, next disabled on last', () => {
  localStorage.setItem('ticoq.lang', 'en');
  const { rerender } = render(
    <LangProvider>
      <SlideStage entries={entries} activeIndex={0} onSelect={vi.fn()} />
    </LangProvider>,
  );
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  rerender(
    <LangProvider>
      <SlideStage entries={entries} activeIndex={2} onSelect={vi.fn()} />
    </LangProvider>,
  );
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
});

it('arrow keys navigate', () => {
  const { container, onSelect } = renderStage(1);
  const stage = container.querySelector('.deck-stage') as HTMLElement;
  fireEvent.keyDown(stage, { key: 'ArrowRight' });
  expect(onSelect).toHaveBeenCalledWith(2);
  fireEvent.keyDown(stage, { key: 'ArrowLeft' });
  expect(onSelect).toHaveBeenCalledWith(0);
});
