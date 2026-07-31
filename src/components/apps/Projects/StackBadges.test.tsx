import { render } from '@testing-library/react';

import { techBadges } from 'data/techBadges';

import { StackBadges } from './StackBadges';

/**
 * The chip row underpins both slides, and until this file existed nothing
 * asserted it rendered a badge at all: a version that emitted empty chips and
 * dropped `getBadge` entirely passed the whole suite. `companies.test.ts`
 * guards the data side — that every label resolves — and this guards the
 * render side.
 */
describe('StackBadges', () => {
  it('renders one chip per stack entry', () => {
    const { container } = render(<StackBadges stack={['Go', 'Docker']} />);
    expect(container.querySelectorAll('.pj-chip')).toHaveLength(2);
  });

  it('shows the registered monogram and colour, not a bare chip', () => {
    const { container } = render(<StackBadges stack={['Go']} />);
    const badge = container.querySelector('.pj-bdg') as HTMLElement;
    expect(badge).toHaveTextContent(techBadges.Go.monogram);
    expect(badge.style.background).toBe('rgb(0, 173, 216)'); // #00add8, as the DOM reports it
  });

  it('labels the chip with the technology name', () => {
    const { container } = render(<StackBadges stack={['Docker']} />);
    expect(container.querySelector('.pj-chip')).toHaveTextContent('Docker');
  });

  it('renders nothing but the wrapper for an empty stack', () => {
    const { container } = render(<StackBadges stack={[]} />);
    expect(container.querySelector('.deck-badges')).toBeTruthy();
    expect(container.querySelectorAll('.pj-chip')).toHaveLength(0);
  });
});
