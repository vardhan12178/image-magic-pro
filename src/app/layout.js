import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata = {
  title: 'Image Magic Pro - Convert & Compress Images',
  description:
    'A high-performance utility for developers. Convert images (PNG, JPG, WebP) with lossless compression and edit screenshots instantly.',
  keywords: [
    'image converter',
    'image optimization',
    'webp converter',
    'nextjs tools',
    'screenshot editor',
    'client-side processing',
  ],
  openGraph: {
    title: 'Next.js Media Optimizer - Fast Image Tool',
    description:
      'Upload, convert, and optimize images with modern formats and client-side tools.',
    url: 'https://image-magic-pro.vercel.app',
    siteName: 'Next.js Media Optimizer',
    type: 'website',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'App Icon',
      },
    ],
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body
        className={clsx(
          inter.variable,
          spaceGrotesk.variable,
          'font-inter bg-zinc-950 text-zinc-100 antialiased min-h-screen flex flex-col overflow-x-hidden'
        )}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-zinc-900 text-zinc-100 border border-zinc-700',
          }}
        />

        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
