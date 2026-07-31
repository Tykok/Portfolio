import { fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import { OSProvider, useOS } from 'context/OSContext';
import fr from 'i18n/fr';

import { TipsDialog } from './TipsDialog';

/** Opens the dialog the way the Start menu does. */
function Opener() {
  const { tipsOpen, openTips } = useOS();
  return (
    <>
      <button type="button" onClick={openTips}>
        open
      </button>
      {tipsOpen && <TipsDialog />}
    </>
  );
}

const renderTips = () =>
  render(
    <LangProvider>
      <OSProvider>
        <Opener />
      </OSProvider>
    </LangProvider>,
  );

const open = () => fireEvent.click(screen.getByRole('button', { name: 'open' }));

describe('TipsDialog', () => {
  it('stays closed until something opens it', () => {
    renderTips();
    expect(document.querySelector('.os-dialog')).toBeNull();
  });

  it('lists every tip of the active locale', () => {
    renderTips();
    open();
    expect(document.querySelectorAll('.tips-list li')).toHaveLength(fr.os_tips.length);
    fr.os_tips.forEach((tip) => {
      expect(screen.getByText(tip)).toBeInTheDocument();
    });
  });

  it('mentions no mascot — the walking rooster is gone', () => {
    // The tips used to be the rooster's speech bubbles, and one of them
    // introduced him by name. With the walker deleted, a tip that says
    // "I'm Cocorico" points at nothing the visitor can see.
    renderTips();
    open();
    expect(document.body.textContent).not.toMatch(/mascotte|mascot|Cocorico/i);
  });

  it('closes on OK', () => {
    renderTips();
    open();
    fireEvent.click(screen.getByRole('button', { name: fr.aos_ok }));
    expect(document.querySelector('.os-dialog')).toBeNull();
  });
});
