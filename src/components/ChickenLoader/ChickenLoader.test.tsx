import { render, screen } from '@testing-library/react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';

describe('ChickenLoader', () => {
  it('renders an accessible loading image with a custom label', () => {
    render(<ChickenLoader label="Chargement…" />);
    expect(screen.getByRole('img', { name: 'Chargement…' })).toBeInTheDocument();
  });
});
