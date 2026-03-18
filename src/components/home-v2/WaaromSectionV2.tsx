interface WaaromItem {
  readonly kenmerk: string;
  readonly betekenis: string;
}

interface WaaromSectionV2Props {
  items: readonly WaaromItem[];
}

const kenmerkIcons: Record<string, React.ReactNode> = {
  "Pragmatische aanpak": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "MKB-focus": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  "Consultant, geen certificeerder": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  "Integrale benadering": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  "Transparante kosten": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  "100% slagingspercentage": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  "15+ jaar ervaring": (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function WaaromSectionV2({ items }: WaaromSectionV2Props) {
  return (
    <article>
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#00875A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#00875A]">
          Waarom MaasISO
        </span>
        <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">
          Waarom kiezen voor MaasISO?
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => {
          const icon = kenmerkIcons[item.kenmerk];
          return (
            <div
              key={item.kenmerk}
              className={`group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#0057B8]/30 ${
                index === items.length - 1 && items.length % 2 !== 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#0057B8] to-[#00875A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="inline-flex rounded-xl bg-[#f0f6ff] p-3 text-[#0057B8] transition-colors duration-300 group-hover:bg-[#0057B8] group-hover:text-white">
                {icon || (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-[#091E42]">{item.kenmerk}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.betekenis}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
