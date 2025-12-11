import { Metadata } from 'next';

declare module 'next' {
  export interface PageProps {
    params: Promise<{ [key: string]: string }>;
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}

declare module 'next/types' {
  export interface PageProps {
    params: Promise<{ [key: string]: string }>;
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}