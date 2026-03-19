interface WaaromItem {
  kenmerk: string;
  betekenis: string;
}

interface WaaromMinimalProps {
  items: readonly WaaromItem[];
}

export function WaaromMinimal({ items }: WaaromMinimalProps) {
  return (
    <section id="waarom" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Waarom MaasISO
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
          Wat maakt ons anders?
        </h2>

        <div className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item.kenmerk}
              className="flex gap-6"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.kenmerk}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.betekenis}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
