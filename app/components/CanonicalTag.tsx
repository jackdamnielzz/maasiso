"use client";

import { usePathname } from "next/navigation";

export default function CanonicalTag() {
  const pathname = usePathname() || "/";
  // Remove trailing .html if present
  const cleanPath = pathname.endsWith(".html") ? pathname.slice(0, -5) : pathname;
  const canonicalUrl = `https://maasiso.nl${cleanPath === "/" ? "" : cleanPath}`;
  return <link rel="canonical" href={canonicalUrl} />;
}