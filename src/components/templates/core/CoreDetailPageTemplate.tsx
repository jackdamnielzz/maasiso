import { getPage } from '@/lib/api';
import AuthorityPageContent from '@/components/features/AuthorityPageContent';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

type CoreDetailPageTemplateProps = {
  title: string;
  strapiSlug: string;
  hub: {
    title: string;
    href: string;
  };
  dataTopic?: string;
};

export default async function CoreDetailPageTemplate({
  title,
  strapiSlug,
  hub,
  dataTopic,
}: CoreDetailPageTemplateProps) {
  const pageData = await getPage(strapiSlug);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: hub.title, href: hub.href },
    { label: title, href: `${hub.href}/${strapiSlug}`.replace(/\/{2,}/g, '/') },
  ];

  if (!pageData || !Array.isArray(pageData.layout) || pageData.layout.length === 0) {
    return (
      <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-topic={dataTopic}>
        <CoreBreadcrumbBar items={breadcrumbs} />
        <section className="py-16 md:py-24">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
              <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
              <div className="p-8 md:p-10 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">{title}</h1>
                <p className="text-gray-600">
                  De inhoud voor deze pagina is niet beschikbaar. Controleer de Strapi configuratie.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AuthorityPageContent
      layout={pageData.layout}
      breadcrumbs={breadcrumbs}
      showBreadcrumbs
      dataTopic={dataTopic}
    />
  );
}
