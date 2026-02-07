import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';

jest.mock('remark-breaks', () => () => null);
jest.mock('react-markdown', () => {
  const React = require('react');

  return function MockReactMarkdown(props: any) {
    const { children, components = {} } = props;
    const content = String(children || '');

    if (content.includes('|') && typeof components.table === 'function') {
      const TableRenderer = components.table;
      return React.createElement(
        TableRenderer,
        null,
        React.createElement('tbody', null, React.createElement('tr', null, React.createElement('td', null, 'A')))
      );
    }

    return React.createElement('div', null, content);
  };
});

const AuthorityPageContent = require('./AuthorityPageContent').default;

describe('AuthorityPageContent', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it('keeps markdown tables horizontally scrollable on small screens', () => {
    const layout: any = [
      {
        id: 'text-1',
        __component: 'page-blocks.text-block',
        alignment: 'left',
        content: [
          '## Wat kost ISO 9001?',
          '',
          '| Kolom A | Kolom B |',
          '|---|---|',
          '| A | B |',
        ].join('\n'),
      },
    ];

    const { container } = render(<AuthorityPageContent layout={layout} />);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('min-w-[640px]');
    expect(table?.parentElement).toHaveClass('overflow-x-auto');
  });

  it('renders only one primary CTA as final section after FAQ', () => {
    const layout: any = [
      {
        id: 'hero-1',
        __component: 'page-blocks.hero',
        title: 'ISO 16175',
        subtitle: 'Sub',
        ctaButton: { text: 'Hero CTA', link: '/contact-hero', style: 'primary' },
      },
      {
        id: 'text-1',
        __component: 'page-blocks.text-block',
        alignment: 'left',
        content: '## Intro\n\nTekst.',
      },
      {
        id: 'button-1',
        __component: 'page-blocks.button',
        text: 'Mid CTA',
        link: '/contact-mid',
        style: 'primary',
      },
      {
        id: 'faq-1',
        __component: 'page-blocks.faq-section',
        items: [{ id: 'q1', question: 'Vraag?', answer: 'Antwoord.' }],
      },
      {
        id: 'button-2',
        __component: 'page-blocks.button',
        text: 'Final CTA',
        link: '/contact-final',
        style: 'primary',
      },
    ];

    const { container } = render(<AuthorityPageContent layout={layout} />);

    expect(screen.queryByRole('link', { name: 'Hero CTA' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mid CTA' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Final CTA' })).toHaveAttribute('href', '/contact-final');

    const main = container.querySelector('main');
    expect(main?.lastElementChild).toHaveAttribute('data-cta-final', 'true');
    expect(container.querySelectorAll('section[data-cta-final=\"true\"]')).toHaveLength(1);
  });
});
