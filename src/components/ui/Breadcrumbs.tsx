type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${item.label}`} className="flex items-center gap-x-2">
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-800">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-[#00875A] underline-offset-2 hover:text-[#006B47] hover:underline"
                >
                  {item.label}
                </a>
              )}
              {!isLast && <span className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { BreadcrumbItem };
