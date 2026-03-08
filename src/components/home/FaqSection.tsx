interface FaqItem {
  readonly vraag: string;
  readonly antwoord: string;
}

interface FaqSectionProps {
  faqItems: readonly FaqItem[];
}

export function FaqSection({ faqItems }: FaqSectionProps) {
  return (
    <article id="faq" className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
      <h2 className="mb-8 text-2xl font-bold md:text-3xl">Veelgestelde vragen</h2>
      <div className="space-y-4">
        {faqItems.map((item) => (
          <details
            key={item.vraag}
            className="group rounded-xl border border-[#dce5f1] bg-white p-6 transition duration-300 hover:border-[#0057B8]/40 open:border-[#0057B8]/50 open:bg-[#f8fbff]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-lg">
              <span>{item.vraag}</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#b9c8dd] text-base text-[#24416a] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-gray-800">{item.antwoord}</p>
          </details>
        ))}
      </div>
    </article>
  );
}
