import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

describe('OptimizedImage', () => {
  it('rendert met verplichte props', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} />);

    const image = screen.getByRole('img', { name: 'Test image' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/api/proxy/assets/test.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('toont loading status en loading tekst', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        loadingText="Custom loading text"
      />
    );

    expect(screen.getByRole('status', { name: 'Custom loading text' })).toBeInTheDocument();
    expect(screen.getAllByText('Custom loading text').length).toBeGreaterThanOrEqual(1);
  });

  it('schakelt naar fallback bij afbeeldingsfout en roept onError aan', async () => {
    const onError = jest.fn();
    render(
      <OptimizedImage
        src="/invalid.jpg"
        alt="Test image"
        width={100}
        height={100}
        fallback="/fallback.jpg"
        onError={onError}
      />
    );

    const image = screen.getByRole('img', { name: 'Test image' });
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', '/fallback.jpg');
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalled();
  });

  it('rendert figure met figcaption wanneer caption aanwezig is', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        caption="Test caption"
      />
    );

    expect(document.querySelector('figure')).toBeInTheDocument();
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('behandelt decoratieve afbeeldingen met lege alt en aria-hidden', () => {
    const { container } = render(
      <OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} decorative />
    );

    const image = container.querySelector('img[aria-hidden="true"]');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', '');
  });

  it('meldt succesvolle load in live status en roept onLoadingComplete aan', async () => {
    const onLoadingComplete = jest.fn();
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        onLoadingComplete={onLoadingComplete}
      />
    );

    const image = screen.getByRole('img', { name: 'Test image' });
    fireEvent.load(image);

    await waitFor(() => {
      expect(screen.getByText('Image loaded: Test image')).toBeInTheDocument();
      expect(onLoadingComplete).toHaveBeenCalled();
    });
  });

  it('past custom wrapper class toe', () => {
    const { container } = render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        wrapperClassName="custom-wrapper"
      />
    );

    expect(container.querySelector('.custom-wrapper')).toBeInTheDocument();
  });

  it('werkt loading en error classes bij op image element', async () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" width={100} height={100} />);

    const image = screen.getByRole('img', { name: 'Test image' });
    expect(image).toHaveClass('opacity-0');

    fireEvent.load(image);
    await waitFor(() => {
      expect(image).not.toHaveClass('opacity-0');
    });

    fireEvent.error(image);
    await waitFor(() => {
      expect(image).toHaveClass('opacity-50');
    });
  });
});
