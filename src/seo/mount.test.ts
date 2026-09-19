import { hideSeoDocument } from './mount';

function setup(): HTMLElement {
  document.body.className = '';
  document.body.innerHTML = '<div id="root"></div><main id="seo-content"><h1>Elie Treport</h1></main>';
  return document.getElementById('seo-content') as HTMLElement;
}

describe('hideSeoDocument', () => {
  it('marque le body, ce qui déclenche la superposition décrite dans os.css', () => {
    setup();
    hideSeoDocument(document);
    expect(document.body.classList.contains('os-mounted')).toBe(true);
  });

  it("retire le document de l'arbre d'accessibilité, pour ne pas le lire deux fois", () => {
    const seo = setup();
    hideSeoDocument(document);
    expect(seo.getAttribute('aria-hidden')).toBe('true');
    expect(seo.hasAttribute('inert')).toBe(true);
  });

  it('laisse le contenu dans le DOM — Google indexe le DOM rendu, pas le HTML source', () => {
    const seo = setup();
    hideSeoDocument(document);
    expect(seo.isConnected).toBe(true);
    expect(seo.textContent).toContain('Elie Treport');
    expect(seo.hasAttribute('hidden')).toBe(false);
    expect(seo.style.display).not.toBe('none');
  });

  it("ne casse pas quand le document n'a pas été prérendu, comme en dev", () => {
    document.body.className = '';
    document.body.innerHTML = '<div id="root"></div>';
    expect(() => hideSeoDocument(document)).not.toThrow();
    expect(document.body.classList.contains('os-mounted')).toBe(true);
  });
});
