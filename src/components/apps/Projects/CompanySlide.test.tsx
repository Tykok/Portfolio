import { render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import type { Company } from 'data/companies';

import { CompanySlide } from './CompanySlide';

const company: Company = {
  id: 'c',
  monogram: 'CC',
  gradient: 'linear-gradient(135deg,#333,#444)',
  name: 'Contoso',
  place: { fr: 'Lyon', en: 'Lyon' },
  period: { fr: 'jan. 2020 → mars 2021', en: 'Jan 2020 → Mar 2021' },
  role: { fr: 'Backend Engineer. Je porte la base.', en: 'Backend Engineer. I own the database.' },
  what: { fr: "Ce que fait l'entreprise.", en: 'What the company does.' },
  work: { fr: ['Chantier un', 'Chantier deux'], en: ['Piece one', 'Piece two'] },
  stack: ['Go', 'Docker'],
};

const renderSlide = (c: Company = company) =>
  render(
    <LangProvider>
      <CompanySlide company={c} />
    </LangProvider>,
  );

it('renders the name, place and period in the hero', () => {
  renderSlide();
  expect(screen.getByText('Contoso')).toBeInTheDocument();
  expect(screen.getByText('Lyon')).toBeInTheDocument();
  expect(screen.getByText('jan. 2020 → mars 2021')).toBeInTheDocument();
});

it('renders what the company does, and the role', () => {
  renderSlide();
  expect(screen.getByText("Ce que fait l'entreprise.")).toBeInTheDocument();
  expect(screen.getByText('Backend Engineer. Je porte la base.')).toBeInTheDocument();
});

it('renders every work line', () => {
  const { container } = renderSlide();
  expect(container.querySelectorAll('.deck-bul li')).toHaveLength(2);
  expect(screen.getByText('Chantier un')).toBeInTheDocument();
  expect(screen.getByText('Chantier deux')).toBeInTheDocument();
});

it('renders a badge per stack entry', () => {
  const { container } = renderSlide();
  expect(container.querySelectorAll('.pj-chip')).toHaveLength(2);
});

it('offers no repo or demo button — employer code is not public', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-acts')).toBeNull();
  expect(container.querySelectorAll('a')).toHaveLength(0);
});

it('shows no takeaway block — company cards carry no lesson', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-takeaway')).toBeNull();
});

it('uses the gradient hero and renders no image', () => {
  const { container } = renderSlide();
  expect(container.querySelector('.deck-hero')).toBeTruthy();
  expect(container.querySelector('img')).toBeNull();
});
