import { createEvent, fireEvent, render, screen } from '@testing-library/react';
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

describe('swiping', () => {
  const stage = () => document.querySelector('.deck-stage') as HTMLElement;

  /* jsdom has no PointerEvent, so createEvent falls back to a plain Event and
     drops clientX, clientY and pointerType from the init. Left as-is the
     component reads undefined coordinates, NaN sails through both guards, and
     the tests pass or fail for reasons that have nothing to do with swiping —
     hence defining all three on the event by hand. */
  const track = () => document.querySelector('.deck-track') as HTMLElement;

  const pointer = (el: HTMLElement, type: 'pointerDown' | 'pointerMove' | 'pointerUp', x: number, y: number, pointerType = 'touch') => {
    const event = createEvent[type](el);
    Object.defineProperties(event, {
      clientX: { value: x },
      clientY: { value: y },
      pointerType: { value: pointerType },
    });
    fireEvent(el, event);
  };

  it('swiping left goes to the next slide', () => {
    const { onSelect } = renderStage(0);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerUp', 100, 108);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('swiping right goes back', () => {
    const { onSelect } = renderStage(1);
    pointer(stage(), 'pointerDown', 100, 100);
    pointer(stage(), 'pointerUp', 220, 96);
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('ignores a short drag — a tap that wandered is not a swipe', () => {
    const { onSelect } = renderStage(0);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerUp', 175, 100);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('ignores a mostly vertical drag, which is a scroll', () => {
    const { onSelect } = renderStage(0);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerUp', 140, 300);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('leaves the mouse alone, so selecting text does not turn the page', () => {
    const { onSelect } = renderStage(0);
    pointer(stage(), 'pointerDown', 300, 100, 'mouse');
    pointer(stage(), 'pointerUp', 100, 100, 'mouse');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not run past the last slide', () => {
    const { onSelect } = renderStage(entries.length - 1);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerUp', 60, 100);
    expect(onSelect).not.toHaveBeenCalled();
  });
  it('the slide follows the finger while it drags', () => {
    renderStage(1);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerMove', 140, 104);
    expect(track().style.transform).toContain('-60px');
  });

  it('a mostly vertical drag leaves the track still, so the slide can scroll', () => {
    const { onSelect } = renderStage(1);
    pointer(stage(), 'pointerDown', 200, 300);
    pointer(stage(), 'pointerMove', 180, 160);
    expect(track().style.transform).toContain('0px');
    pointer(stage(), 'pointerUp', 180, 160);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('drags past the last slide meet resistance rather than empty space', () => {
    renderStage(entries.length - 1);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerMove', 110, 100);
    const pulled = Number(/(-?[\d.]+)px/.exec(track().style.transform)?.[1]);
    expect(pulled).toBeLessThan(0);
    expect(pulled).toBeGreaterThan(-90);
  });

  it('releasing mid-drag snaps back without turning the page', () => {
    const { onSelect } = renderStage(1);
    pointer(stage(), 'pointerDown', 200, 100);
    pointer(stage(), 'pointerMove', 180, 100);
    pointer(stage(), 'pointerUp', 180, 100);
    expect(onSelect).not.toHaveBeenCalled();
    expect(track().style.transform).toContain('0px');
  });
});

it('renders pagination dots, the rail stand-in on a phone', () => {
  renderStage(1);
  expect(screen.getByRole('navigation', { name: 'Slides' })).toBeInTheDocument();
});
