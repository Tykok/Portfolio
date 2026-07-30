import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import type { Project } from 'data/projects';

import { SlideRail } from './SlideRail';

const mk = (id: string, title: string): Project => ({
  id,
  emoji: '',
  monogram: id.toUpperCase(),
  accent: '#000',
  gradient: 'linear-gradient(135deg,#111,#222)',
  title: { fr: title, en: title },
  year: '2024',
  status: { label: { fr: 'x', en: 'x' }, type: 'live' },
  stack: [],
  tags: [],
  desc: { fr: '', en: '' },
  bullets: { fr: [], en: [] },
  repo: '#',
  demo: '#',
});

const projects = [mk('a', 'Alpha'), mk('b', 'Beta'), mk('c', 'Gamma')];

it('renders one thumbnail per project', () => {
  render(
    <LangProvider>
      <SlideRail projects={projects} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  expect(screen.getAllByRole('button')).toHaveLength(3);
  expect(screen.getByText('Alpha')).toBeInTheDocument();
});

it('marks the active thumbnail with the "on" class', () => {
  const { container } = render(
    <LangProvider>
      <SlideRail projects={projects} activeIndex={1} onSelect={() => {}} />
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
      <SlideRail projects={projects} activeIndex={0} onSelect={onSelect} />
    </LangProvider>,
  );
  fireEvent.click(screen.getByText('Gamma'));
  expect(onSelect).toHaveBeenCalledWith(2);
});

it('shows the monogram even when the project has a cover', () => {
  // Deliberate: .deck-thumb-ico is 34×26 px, where no real image is legible.
  // Covers belong to the hero only. See the 2026-07-30 spec.
  const withCover: Project = { ...mk('d', 'Delta'), cover: '/projects/delta.webp' };
  const { container } = render(
    <LangProvider>
      <SlideRail projects={[withCover]} activeIndex={0} onSelect={() => {}} />
    </LangProvider>,
  );
  const ico = container.querySelector('.deck-thumb-ico');
  expect(ico).toHaveTextContent('D');
  expect(ico?.getAttribute('style') ?? '').not.toContain('delta.webp');
});
