import type { ReactNode } from "react";

interface WaaromItem {
  kenmerk: string;
  betekenis: string;
}

interface WaaromSectionV3Props {
  items: readonly WaaromItem[];
}

export function WaaromSectionV3({ items }: WaaromSectionV3Props) {
  return (
    <article id="waarom">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF8B00]/10 to-[#0057B8]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FF8B00]">
          Waarom MaasISO
        </span>
        <h2 className="mt-5 text-4xl font-extrabold text-[#091E42] md:text-5xl">
          Wat maakt ons anders?
        </h2>
        <p className="mt-5 mx-auto max-w-2xl text-xl text-gray-600 leading-relaxed">
          MaasISO onderscheidt zich door een unieke combinatie van expertise, aanpak en focus op uw resultaat.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.kenmerk}
            className="group relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Gradient accent on hover */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#0057B8] to-[#00875A] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Icon with enhanced styling */}
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#0057B8]/10 to-[#00875A]/10 p-4 text-[#0057B8]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="mt-6 text-xl font-bold text-[#091E42] group-hover:text-[#0057B8] transition-colors">
              {item.kenmerk}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              {item.betekenis}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
