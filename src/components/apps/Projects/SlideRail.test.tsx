import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import type { DeckEntry } from 'data/deck';
import type { Project } from 'data/projects';

import { SlideRail } from './SlideRail';

const mkProject = (id: string, title: string): DeckEntry => ({
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
    desc: { fr: '', en: '' },
    bullets: { fr: [], en: [] },
    repo: '#',
    demo: '#',
  },
});

const mkCompany = (id: string, name: string): DeckEntry => ({
  kind: 'company',
  company: {
    id,
    monogram: id.toUpperCase().slice(0, 2),
    gradient: 'linear-gradient(135deg,#333,#444)',
    name,
    place: { fr: 'Lyon', en: 'Lyon' },
    period: { fr: 'jan. 2020', en: 'Jan 2020' },
    role: { fr: 'r', en: 'r' },
    what: { fr: 'w', en: 'w' },
    work: { fr: ['a'], en: ['a'] },
    stack: [],
  },
});

const entries = [mkProject('a', 'Alpha'), mkProject('b', 'Beta'), mkCompany('cx', 'Contoso')];

it('renders one thumbnail per project', () => {
  render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  expect(screen.getAllByRole('button')).toHaveLength(3);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
});

it('marks the active thumbnail with the "on" class', () => {
  const { container } = render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={1} onSelect={() => {}} />
    </LangProvider>,
  );
  const active = container.querySelectorAll('.deck-thumb.on');
  expect(active).toHaveLength(1);
  expect(active[0]).toHaveTextContent('Beta');
});

it('fires onSelect with the index when a thumbnail is clicked', () => {
  const onSelect = vi.fn();
  render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={onSelect} />
    </LangProvider>,
  );
  fireEvent.click(screen.getByText('Beta'));
  expect(onSelect).toHaveBeenCalledWith(1);
});

it('shows the monogram even when the project has a cover', () => {
  // Deliberate: .deck-thumb-ico is 34×26 px, where no real image is legible.
  // Covers belong to the hero only. See the 2026-07-30 spec.
  const { project } = mkProject('d', 'Delta') as Extract<DeckEntry, { kind: 'personal' }>;
  const withCover: Project = { ...project, cover: '/projects/delta.webp' };
  const { container } = render(
    <LangProvider>
      <SlideRail entries={[{ kind: 'personal', project: withCover }]} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  const ico = container.querySelector('.deck-thumb-ico');
  expect(ico).toHaveTextContent('D');
  expect(ico?.getAttribute('style') ?? '').not.toContain('delta.webp');
});

it('heads each group with its own count', () => {
  const { container } = render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  const heads = Array.from(container.querySelectorAll('.deck-rail .hd')).map((h) => h.textContent);
  expect(heads).toHaveLength(2);
  expect(heads[0]).toContain('2');
  expect(heads[1]).toContain('1');
});

it('reports a global index when a company thumbnail is clicked, not its index within its group', () => {
  // The company is 3rd overall and 1st among companies. A naive grouped
  // implementation reports 0 here, which silently opens the wrong slide.
  const onSelect = vi.fn();
  render(
    <LangProvider>
      <SlideRail entries={entries} activeIndex={0} onSelect={onSelect} />
    </LangProvider>,
  );
  fireEvent.click(screen.getByText('Contoso'));
  expect(onSelect).toHaveBeenCalledWith(2);
});
