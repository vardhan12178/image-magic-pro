import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Image Magic Pro - Free Image Converter & Compressor',
  description:
    'Convert and compress images to WebP, JPEG, or PNG formats with lossless quality. Download your optimized images instantly as a ZIP. 100% free.',
  keywords: [
    'image converter',
    'compress images',
    'webp converter',
    'jpeg to webp',
    'png to jpeg',
    'image optimization',
    'image to zip',
    'image compressor online',
    'free image tool',
    'online image converter'
  ],
  openGraph: {
    title: 'Image Magic Pro - Convert & Compress Images Effortlessly',
    description:
      'Upload, convert and compress images to multiple formats. Fast, free, and optimized for SEO and performance.',
    url: 'https://your-domain.com', 
    siteName: 'Image Magic Pro',
    type: 'website',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'Image Magic Pro Icon',
      },
    ],
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-50 flex flex-col min-h-screen`}>
        <Toaster position="top-center" reverseOrder={false} />
        <header className="bg-gray-900 py-4 shadow-md">
          <h1 className="text-center text-xl md:text-2xl font-semibold">🌟 Image Magic Pro</h1>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          {children}
        </main>
        <footer className="bg-gray-900 py-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Image Magic Pro. Crafted by Bala Vardhan 🚀
        </footer>
      </body>
    </html>
  );
}
