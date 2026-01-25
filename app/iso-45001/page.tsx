export default function Iso45001Page() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <section className="py-16 md:py-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
            <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
            <div className="p-8 md:p-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#091E42]">
                ISO 45001 advies & begeleiding
              </h1>
              <p className="text-gray-600 mb-6">
                MaasISO ondersteunt organisaties met een pragmatische aanpak voor gezond en veilig werken volgens ISO 45001.
              </p>
              <a
                href="/contact"
                className="primary-button inline-block"
              >
                Neem contact op
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
