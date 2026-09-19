import { render, screen } from '@testing-library/react';
import { mockProjects } from 'api/mock/projects.mock';

import { companies } from 'data/companies';
import { identity } from 'data/identity';

import { HomeBody } from './HomeBody';

describe('HomeBody', () => {
  beforeEach(() => {
    render(<HomeBody lang="fr" />);
  });

  it('porte un seul h1, et c\'est le nom nu — la requête cible', () => {
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Elie Treport');
  });

  it('écrit l\'alias en toutes lettres dans le corps de page', () => {
    expect(screen.getByText(/Alias Tykok/)).toBeInTheDocument();
  });

  it('sert la biographie complète, qui est le texte réel de la page', () => {
    identity.bio.fr.split('\n\n').forEach((paragraph) => {
      expect(screen.getByText(paragraph.trim())).toBeInTheDocument();
    });
  });

  it('nomme chaque entreprise du parcours', () => {
    companies.forEach((company) => {
      expect(screen.getByRole('heading', { name: new RegExp(company.name) })).toBeInTheDocument();
    });
  });

  it('nomme et décrit chaque projet personnel', () => {
    mockProjects.forEach((project) => {
      expect(screen.getByRole('heading', { name: new RegExp(project.title.fr.split(' — ')[0]) })).toBeInTheDocument();
      expect(screen.getByText(project.desc.fr)).toBeInTheDocument();
    });
  });

  it('marque les profils externes en rel="me", ce qui confirme sameAs dans l\'autre sens', () => {
    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(github).toHaveAttribute('href', 'https://github.com/Tykok');
    expect(github).toHaveAttribute('rel', expect.stringContaining('me'));
  });

  it('n\'émet aucun lien mort — repo et demo valent « # » quand il n\'y a pas de lien public', () => {
    const deadLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '#');
    expect(deadLinks).toHaveLength(0);
  });

  it('rend aussi en anglais, pour que le lot 3 n\'ait rien à réécrire', () => {
    render(<HomeBody lang="en" />);
    expect(screen.getAllByText(identity.bio.en.split('\n\n')[0].trim()).length).toBeGreaterThan(0);
  });

  it('ne publie pas l\'email en clair — il atteint désormais le tout premier octet de chaque réponse', () => {
    // Avant ce lot, l'email n'apparaissait dans le DOM qu'après l'animation de
    // démarrage et un clic ; un moissonneur qui se contente d'un curl ne le
    // voyait jamais. Le document SEO, lui, part avec la première réponse.
    const { container } = render(<HomeBody lang="fr" />);
    expect(container.innerHTML).not.toContain('mailto:');
    expect(container.innerHTML).not.toContain(identity.email);
  });
});
