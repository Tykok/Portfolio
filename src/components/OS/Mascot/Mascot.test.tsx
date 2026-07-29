import { act, fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import { OSProvider, useOS } from 'context/OSContext';

import { Mascot } from './Mascot';

/** Drives the mascot the way the Terminal's coqsay command does. */
function Trigger({ msg }: { msg: string }) {
  const { showMascot } = useOS();
  return (
    <button type="button" onClick={() => showMascot(msg)}>
      go
    </button>
  );
}

function renderMascot(msg = 'Cocorico depuis le terminal') {
  return render(
    <LangProvider>
      <OSProvider>
        <Mascot />
        <Trigger msg={msg} />
      </OSProvider>
    </LangProvider>,
  );
}

describe('Mascot', () => {
  it('renders the walker', () => {
    renderMascot();
    expect(document.querySelector('.mascot-walker')).toBeInTheDocument();
  });

  it('shows a message pushed through showMascot', () => {
    renderMascot('Cocorico depuis le terminal');
    expect(screen.queryByText('Cocorico depuis le terminal')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'go' }));
    });

    expect(screen.getByText('Cocorico depuis le terminal')).toBeInTheDocument();
  });

  it('dismisses an external message on click', () => {
    renderMascot('à fermer');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'go' }));
    });
    expect(screen.getByText('à fermer')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('✕'));
    });
    expect(screen.queryByText('à fermer')).not.toBeInTheDocument();
  });
});
