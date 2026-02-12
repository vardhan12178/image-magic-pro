import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Image Magic Pro | Image Converter and Screenshot Editor",
  description:
    "Professional image conversion and local screenshot editing in one streamlined workflow.",
  keywords: [
    "image converter",
    "webp converter",
    "screenshot editor",
    "nextjs image tool",
    "batch image conversion",
  ],
  openGraph: {
    title: "Image Magic Pro",
    description:
      "Convert images and edit screenshots quickly with a clean, production-grade interface.",
    siteName: "Image Magic Pro",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          inter.variable,
          spaceGrotesk.variable,
          "font-inter min-h-screen bg-slate-950 text-slate-100 antialiased"
        )}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "border border-white/15 bg-slate-900 text-slate-100 shadow-lg shadow-black/30",
          }}
        />
        {children}
      </body>
    </html>
  );
}

