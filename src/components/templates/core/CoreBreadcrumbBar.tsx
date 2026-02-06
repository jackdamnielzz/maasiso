import SchemaMarkup from '@/components/ui/SchemaMarkup';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { getCanonicalSiteUrl } from '@/lib/url/canonicalSiteUrl';

type CoreBreadcrumbBarProps = {
  items: BreadcrumbItem[];
};

export default function CoreBreadcrumbBar({ items }: CoreBreadcrumbBarProps) {
  const siteUrl = getCanonicalSiteUrl();
  const breadcrumbSchemaItems = items.map((item) => ({
    name: item.label,
    item: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`,
  }));

  return (
    <>
      <SchemaMarkup breadcrumbs={{ items: breadcrumbSchemaItems }} />
      <div className="bg-white/80 border-b border-slate-200">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs items={items} />
        </div>
      </div>
    </>
  );
}
