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

    const imageMatch = content.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch && typeof components.img === 'function') {
      const ImgRenderer = components.img;
      return React.createElement(ImgRenderer, {
        src: imageMatch[2],
        alt: imageMatch[1],
      });
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

  it('renders hero background images via the proxy route', () => {
    const layout: any = [
      {
        id: 'hero-1',
        __component: 'page-blocks.hero',
        title: 'ISO 45001',
        subtitle: 'Sub',
        backgroundImage: {
          id: 'img-1',
          url: '/uploads/iso45001-hero.jpg',
          alternativeText: 'ISO 45001 hero',
        },
      },
    ];

    render(<AuthorityPageContent layout={layout} />);

    expect(screen.getByAltText('ISO 45001 hero')).toHaveAttribute(
      'src',
      '/api/proxy/assets/uploads/iso45001-hero.jpg'
    );
  });

  it('uses page featured image as hero fallback when hero background is missing', () => {
    const layout: any = [
      {
        id: 'hero-1',
        __component: 'page-blocks.hero',
        title: 'ISO 45001',
        subtitle: 'Sub',
      },
    ];

    render(
      <AuthorityPageContent
        layout={layout}
        heroFallbackImage={{
          id: 'featured-1',
          name: 'featured.jpg',
          alternativeText: 'ISO 45001 featured',
          caption: '',
          width: 1200,
          height: 630,
          formats: {},
          hash: 'featured',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 10,
          url: '/uploads/iso45001-featured.jpg',
          provider: 'local',
          createdAt: '2026-02-08T00:00:00.000Z',
          updatedAt: '2026-02-08T00:00:00.000Z',
          publishedAt: '2026-02-08T00:00:00.000Z',
        }}
      />
    );

    expect(screen.getByAltText('ISO 45001 featured')).toHaveAttribute(
      'src',
      '/api/proxy/assets/uploads/iso45001-featured.jpg'
    );
  });

  it('renders markdown images via the proxy route', () => {
    const layout: any = [
      {
        id: 'text-1',
        __component: 'page-blocks.text-block',
        alignment: 'left',
        content: '![Afbeelding](/uploads/iso45001-content.png)',
      },
    ];

    render(<AuthorityPageContent layout={layout} />);

    expect(screen.getByAltText('Afbeelding')).toHaveAttribute(
      'src',
      '/api/proxy/assets/uploads/iso45001-content.png'
    );
  });

  it('renders feature icons via the proxy route', () => {
    const layout: any = [
      {
        id: 'feature-grid-1',
        __component: 'page-blocks.feature-grid',
        title: 'Stappen',
        features: [
          {
            id: 'feature-1',
            title: 'Stap 1',
            description: 'Beschrijving',
            icon: {
              id: 'icon-1',
              url: '/uploads/iso45001-icon.svg',
              alternativeText: 'Stap icoon',
            },
          },
        ],
      },
    ];

    render(<AuthorityPageContent layout={layout} />);

    expect(screen.getByAltText('Stap icoon')).toHaveAttribute(
      'src',
      '/api/proxy/assets/uploads/iso45001-icon.svg'
    );
  });

  it('renders markdown bold markers in hero subtitle and CTA description', () => {
    const layout: any = [
      {
        id: 'hero-1',
        __component: 'page-blocks.hero',
        title: 'ISO 14001',
        subtitle: 'ISO 14001 is een **milieumanagementsysteem**.',
      },
      {
        id: 'faq-1',
        __component: 'page-blocks.faq-section',
        items: [{ id: 'q1', question: 'Vraag?', answer: 'Antwoord.' }],
      },
      {
        id: 'button-1',
        __component: 'page-blocks.button',
        text: 'Neem contact op',
        link: '/contact',
        description: 'Wij zijn **consultant, geen certificeerder**.',
      },
    ];

    render(<AuthorityPageContent layout={layout} />);

    expect(screen.getByText('milieumanagementsysteem', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('consultant, geen certificeerder', { selector: 'strong' })).toBeInTheDocument();
  });

  it('keeps expert quote attribution lines from Strapi content', () => {
    const layout: any = [
      {
        id: 'text-quote-1',
        __component: 'page-blocks.text-block',
        alignment: 'left',
        content: [
          '## Expertquote',
          '',
          '> "Een praktisch systeem werkt beter dan dikke handboeken."',
          '>',
          '> **— Niels Maas, Senior consultant, MaasISO**',
        ].join('\n'),
      },
    ];

    render(<AuthorityPageContent layout={layout} />);

    expect(screen.getByText(/Niels Maas/i)).toBeInTheDocument();
    expect(screen.getByText(/praktisch systeem werkt beter/i)).toBeInTheDocument();
  });
});
