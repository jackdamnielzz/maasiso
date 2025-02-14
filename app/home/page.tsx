import { Metadata } from 'next'
import { getPage } from '../../src/lib/api'
import { marked } from 'marked'

export const metadata: Metadata = {
  title: 'MaasISO - Professionele ISO Certificering Diensten',
  description: 'Expert in ISO certificering en compliance diensten voor bedrijven. Behaal uw certificering met professionele begeleiding van MaasISO.'
}

interface Icon {
  data: {
    attributes: {
      url: string;
      alternativeText?: string;
    }
  }
}

interface Feature {
  id: number | string;
  title: string;
  description: string;
  link?: string;
  icon?: Icon;
}

interface HeroComponent {
  id: string;
  __component: 'page-blocks.hero';
  title: string;
  subtitle?: string;
}

interface FeatureGridComponent {
  id: string;
  __component: 'page-blocks.feature-grid';
  features: Feature[];
}

interface TextBlockComponent {
  id: string;
  __component: 'page-blocks.text-block';
  content: string;
  alignment?: 'left' | 'center' | 'right';
}

interface ButtonComponent {
  id: string;
  __component: 'page-blocks.button';
  text: string;
  link: string;
  style?: string;
}

type PageComponent = HeroComponent | FeatureGridComponent | TextBlockComponent | ButtonComponent;

interface Page {
  id: number | string;
  title: string;
  slug: string;
  layout?: PageComponent[];
}

export default async function HomePage() {
  const page = await getPage('home') as Page

  if (!page?.layout) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-gray-600">Loading content...</p>
      </main>
    )
  }

  const heroBlock = page.layout.find(item => item.__component === 'page-blocks.hero') as HeroComponent | undefined
  const featureGridBlock = page.layout.find(item => item.__component === 'page-blocks.feature-grid') as FeatureGridComponent | undefined
  const textBlocks = page.layout.filter(item => item.__component === 'page-blocks.text-block') as TextBlockComponent[]
  const buttonBlock = page.layout.find(item => item.__component === 'page-blocks.button') as ButtonComponent | undefined

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      {heroBlock && (
        <section className="w-full bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {heroBlock.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600">
                {heroBlock.subtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Feature Grid */}
      {featureGridBlock?.features && (
        <section className="w-full py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureGridBlock.features.map((feature) => (
                <a 
                  key={feature.id} 
                  href={feature.link || '#'}
                  className="group bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  {feature.icon && (
                    <div className="mb-4 flex justify-center">
                      <img 
                        src={`http://153.92.223.23:1337${feature.icon.data.attributes.url}`}
                        alt={feature.icon.data.attributes.alternativeText || feature.title}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Text Block Sections */}
      {textBlocks.map((textBlock) => (
        <section key={textBlock.id} className="w-full py-12 bg-white">
          <div className={`container mx-auto px-4 ${
            textBlock.alignment === 'center' ? 'text-center' : ''
          }`}>
            <div 
              className="prose max-w-none md:prose-lg mx-auto"
              dangerouslySetInnerHTML={{ 
                __html: marked(textBlock.content || '') 
              }} 
            />
          </div>
        </section>
      ))}

      {/* CTA Button Section */}
      {buttonBlock && (
        <section className="w-full py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <a 
              href={buttonBlock.link}
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              {buttonBlock.text}
            </a>
          </div>
        </section>
      )}
    </main>
  )
}
