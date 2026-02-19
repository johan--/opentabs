import { Archivo_Black, Space_Grotesk, Space_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import './global.css';

const fontHead = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-head',
});

const fontSans = Space_Grotesk({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Space_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${fontHead.variable} ${fontSans.variable} ${fontMono.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
