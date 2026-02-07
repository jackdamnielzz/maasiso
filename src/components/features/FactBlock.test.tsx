import { render, screen } from '@testing-library/react';
import { FactBlock } from './FactBlock';

describe('FactBlock', () => {
  it('renders label, value and source links when source URLs are available', () => {
    render(
      <FactBlock
        data={{
          id: 'fact-1',
          label: 'Aantal certificaten',
          value: '1,1 miljoen',
          source: ['https://www.iso.org/standard/62542.html', 'https://www.nen.nl/'],
        }}
      />
    );

    expect(screen.getByText('Aantal certificaten')).toBeInTheDocument();
    expect(screen.getByText('1,1 miljoen')).toBeInTheDocument();
    expect(screen.getByText('Bron:', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ISO' })).toHaveAttribute('href', 'https://www.iso.org/standard/62542.html');
    expect(screen.getByRole('link', { name: 'NEN' })).toHaveAttribute('href', 'https://www.nen.nl/');
  });
});
