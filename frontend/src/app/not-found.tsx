import Link from 'next/link';

export default function NotFound() {
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
        <div className="flex justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-[#FF8B00] text-white rounded-md hover:bg-[#E67E00] transition-colors"
          >
            Naar homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
