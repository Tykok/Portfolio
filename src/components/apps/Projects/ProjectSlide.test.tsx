import { render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Project } from 'data/projects';

import { ProjectSlide } from './ProjectSlide';

const base: Project = {
  id: 'x',
  emoji: '🚀',
  monogram: 'XX',
  accent: '#123456',
  gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
  title: { fr: 'Titre', en: 'Title' },
  year: '2024',
  status: { label: { fr: 'En prod', en: 'Live' }, type: 'live' },
  stack: [{ label: 'Go', color: 'blue' }],
  tags: ['Go'],
  desc: { fr: 'Desc FR', en: 'Desc EN' },
  bullets: { fr: ['point un'], en: ['bullet one'] },
  repo: '#',
  demo: '#',
};

const renderSlide = (p: Project) =>
  render(
    <LangProvider>
      <ProjectSlide project={p} />
    </LangProvider>,
  );

it('renders title, desc and bullets (FR default)', () => {
  renderSlide(base);
  expect(screen.getByText('Titre')).toBeInTheDocument();
  expect(screen.getByText('Desc FR')).toBeInTheDocument();
  expect(screen.getByText('point un')).toBeInTheDocument();
});

it('uses gradient hero (no cover) — no img rendered', () => {
  const { container } = renderSlide(base);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.deck-hero')).toBeTruthy();
});

it('renders cover image when present', () => {
  const { container } = renderSlide({ ...base, cover: '/shot.png' });
  /* Queried by class, not by role: the cover carries alt="" because the
     adjacent title already names the project, and an empty alt makes the
     image presentational — it has no img role to query. */
  const cover = container.querySelector('.deck-hero-img');
  expect(cover).toHaveAttribute('src', '/shot.png');
  expect(cover).toHaveAttribute('alt', '');
});

it('hides role line when role absent, shows it when present', () => {
  const { rerender } = renderSlide(base);
  expect(screen.queryByText(/Role/i)).toBeNull();
  rerender(
    <LangProvider>
      <ProjectSlide project={{ ...base, role: { fr: 'Lead', en: 'Lead' } }} />
    </LangProvider>,
  );
  expect(screen.getByText('Lead')).toBeInTheDocument();
});

it('shows placeholder text when repo and demo are both "#"', () => {
  renderSlide(base);
  expect(screen.getByText('liens placeholder')).toBeInTheDocument();
});
