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
    url: 'https://image-magic-pro.vercel.app', 
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
        {children}
      </body>
    </html>
  );
}