import { render } from '@testing-library/react';

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
});
