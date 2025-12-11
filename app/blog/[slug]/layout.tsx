import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  parallel: boolean;
}

export default function BlogPostLayout({
  children,
  parallel = true,
}: LayoutProps) {
  return children;
}