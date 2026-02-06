import { render, screen } from '@testing-library/react';
import { FactBlock } from './FactBlock';

describe('FactBlock', () => {
  it('renders label, value and source when source is available', () => {
    render(
      <FactBlock
        data={{
          id: 'fact-1',
          label: 'Aantal certificaten',
          value: '1,1 miljoen',
          source: 'ISO Survey 2023',
        }}
      />
    );

    expect(screen.getByText('Aantal certificaten')).toBeInTheDocument();
    expect(screen.getByText('1,1 miljoen')).toBeInTheDocument();
    expect(screen.getByText(/Bron:\s*ISO Survey 2023/)).toBeInTheDocument();
  });
});
