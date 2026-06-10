import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#091E42] focus:px-4 focus:py-2 focus:text-white"
      >
        Ga naar hoofdinhoud
      </a>
      <Header />
      <main id="main" className="flex-grow w-full pt-20">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
