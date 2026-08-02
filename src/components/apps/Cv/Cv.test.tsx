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
  it('carries Pictarine as one entry, not a timeline split in two', () => {
    // The two former entries shared a job title, so the split read as padding.
    renderCv();
    expect(screen.getByText('oct. 2022 – présent')).toBeInTheDocument();
    expect(screen.queryByText('oct. 2022 – oct. 2024')).not.toBeInTheDocument();
    expect(screen.getAllByText('Pictarine · Toulouse')).toHaveLength(1);
  });

  it('keeps the work from both former Pictarine entries', () => {
    // Merging is only safe if nothing was dropped: one bullet from each of the
    // two entries, and the catalogue line that only the older one carried.
    renderCv();
    expect(screen.getByText(/Cloud Functions, Cloud Scheduler et Cloud Run/)).toBeInTheDocument();
    expect(screen.getByText(/catalogue produit/)).toBeInTheDocument();
    expect(screen.getByText(/Outil interne en Next\.js/)).toBeInTheDocument();
  });

  it('offers a PDF that is really downloadable, and a print button that prints', () => {
    // Both buttons used to be broken: the download one was a disabled stub,
    // and the print one called window.print() with no @media print behind it.
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderCv();

    const download = screen.getByText(fr.cv_dl).closest('a');
    expect(download).toHaveAttribute('href', '/cv-elie-treport-fr.pdf');
    expect(download).toHaveAttribute('download');

    screen.getByText(fr.cv_print).click();
    expect(print).toHaveBeenCalled();
    print.mockRestore();
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

  it('states the GCP work, which the CV was omitting entirely', () => {
    renderCv();
    expect(screen.getByText(/Cloud Functions, Cloud Scheduler et Cloud Run/)).toBeInTheDocument();
  });

  it('names the MecaLIFE vehicle-report platform before the auction one', () => {
    const { container } = renderCv();
    const text = container.textContent ?? '';
    const reports = text.indexOf('rapports détaillés de véhicules');
    const auction = text.indexOf('ventes aux enchères');
    expect(reports).toBeGreaterThan(-1);
    expect(auction).toBeGreaterThan(-1);
    expect(reports).toBeLessThan(auction);
  });

  it('lists PHP, Laravel and GCP among the hard skills', () => {
    // Scoped to .cv2-skill on purpose: these labels also appear as per-role
    // .cv2-tag chips, so an unscoped getByText would match several nodes and
    // Testing Library throws on that.
    const { container } = renderCv();
    const skills = Array.from(container.querySelectorAll('.cv2-skill')).map((s) => s.textContent ?? '');
    ['PHP', 'Laravel', 'GCP'].forEach((tech) => {
      expect(skills.some((label) => label.includes(tech))).toBe(true);
    });
  });

  it('names no partner — the constraint covers the CV, not only the company cards', () => {
    // companies.test.ts guards the card data. The CV describes the same four
    // employers, so it is the other place a partner name could land, and
    // EXPERIENCE is module-private — the rendered document is the way in.
    const { container } = renderCv();
    const rendered = (container.textContent ?? '').toLowerCase();
    ['walgreens', 'cvs', 'fuji'].forEach((partner) => {
      expect(rendered).not.toContain(partner);
    });
  });
});
