'use client';

import Link from 'next/link';

export default function NotFoundContent() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#091E42] mb-4">
          Pagina niet gevonden
        </h1>
        <p className="text-[#091E42]/70 mb-8 max-w-md mx-auto">
          De pagina die u zoekt bestaat niet of is verplaatst. 
          Controleer of u de juiste URL heeft ingevoerd of ga terug naar de homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2 bg-[#FF8B00] text-[#091E42] font-semibold rounded-md hover:bg-[#E67E00] transition-colors"
          >
            Naar homepage
          </Link>
          <Link
            href="/contact/"
            className="px-6 py-2 bg-[#091E42] text-white font-semibold rounded-md hover:bg-[#0a2550] transition-colors"
          >
            Plan een kennismaking
          </Link>
        </div>

        <div className="mt-10 text-sm text-[#091E42]/70">
          <p className="mb-3 font-medium text-[#091E42]">Misschien zocht u een van deze pagina&apos;s:</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <li>
              <Link href="/iso-certificering/" className="text-[#0057B8] hover:underline">
                ISO-certificering
              </Link>
            </li>
            <li>
              <Link href="/informatiebeveiliging/" className="text-[#0057B8] hover:underline">
                Informatiebeveiliging
              </Link>
            </li>
            <li>
              <Link href="/avg-wetgeving/" className="text-[#0057B8] hover:underline">
                AVG-wetgeving
              </Link>
            </li>
            <li>
              <Link href="/kennis/blog/" className="text-[#0057B8] hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}