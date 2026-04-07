import type { Metadata } from 'next';
import { Playfair_Display, Lora } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import { BookProvider } from '@/context/BookContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'My Reading Log',
  description: 'A personal reading journal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable}`}>
      <body className="bg-[#111111] text-stone-100 font-lora min-h-screen">
        <BookProvider>
          <Nav />
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </BookProvider>
      </body>
    </html>
  );
}
