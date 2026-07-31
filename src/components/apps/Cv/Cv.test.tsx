import { render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import { identity } from 'data/identity';
import fr from 'i18n/fr';

import { Cv } from './Cv';

const renderCv = () =>
  render(
    <LangProvider>
      <Cv />
    </LangProvider>,
  );

describe('Cv app', () => {
  it('lists the two Pictarine roles separately', () => {
    renderCv();
    expect(screen.getByText('oct. 2024 – présent')).toBeInTheDocument();
    expect(screen.getByText('oct. 2022 – oct. 2024')).toBeInTheDocument();
    expect(screen.getAllByText('Pictarine · Toulouse')).toHaveLength(2);
  });

  it('lists the MecaLIFE internship apart from the full stack role', () => {
    renderCv();
    expect(screen.getByText('mars – août 2021')).toBeInTheDocument();
    expect(screen.getByText('sept. 2021 – sept. 2022')).toBeInTheDocument();
    expect(screen.getByText('Développeur Full Stack — stage')).toBeInTheDocument();
  });

  it('shows every education entry, down to the baccalauréat', () => {
    renderCv();
    ['2022 – 2024', '2021 – 2022', '2020 – 2021', '2018 – 2020', '2015 – 2018'].forEach((yr) => {
      expect(screen.getByText(yr)).toBeInTheDocument();
    });
    expect(screen.getByText('Bachelor — Programmation informatique')).toBeInTheDocument();
  });

  it('renders the interests section', () => {
    renderCv();
    expect(screen.getByText(fr.cv_interests)).toBeInTheDocument();
    identity.interests.fr.forEach((i) => {
      expect(screen.getByText(i)).toBeInTheDocument();
    });
  });

  it('splits the multi-paragraph bio instead of collapsing it', () => {
    renderCv();
    const paragraphs = document.querySelectorAll('.cv2-profile');
    expect(paragraphs.length).toBe(identity.bio.fr.split('\n\n').length);
    expect(paragraphs.length).toBeGreaterThan(1);
  });

  it('never prints a phone number', () => {
    const { container } = renderCv();
    expect(container.textContent).not.toMatch(/\b0\d(?:[\s.-]?\d{2}){4}\b/);
  });

  it('states what Elie wants to work on', () => {
    renderCv();
    expect(screen.getByText(fr.cv_wants)).toBeInTheDocument();
    expect(document.querySelectorAll('.cv2-want p')).toHaveLength(3);
    expect(screen.getByText("Le back, l'infra et les bases de données.")).toBeInTheDocument();
    expect(screen.getByText('Un endroit où on apprend.')).toBeInTheDocument();
  });

  it('fills all three lines of the block, lead and rest', () => {
    const { container } = renderCv();
    const lines = container.querySelectorAll('.cv2-want p');
    expect(lines).toHaveLength(3);
    lines.forEach((line) => {
      const lead = line.querySelector('b');
      expect(lead?.textContent?.trim()).toBeTruthy();
      expect(line.textContent?.replace(lead?.textContent ?? '', '').trim()).toBeTruthy();
    });
  });
});
