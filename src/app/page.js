"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ScreenshotEditor = dynamic(() => import('./components/ScreenshotEditor'), { ssr: false });

export default function Home() {
  const [tab, setTab] = useState('convert');
  const [files, setFiles] = useState([]);
  const [currentFormat, setCurrentFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState('webp');
  const [compress, setCompress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [pastedFormat, setPastedFormat] = useState('png');
  const [pastedName, setPastedName] = useState('screenshot');

  useEffect(() => {
    if (files.length > 0) {
      const firstFileFormat = files[0].type.split('/')[1];
      setCurrentFormat(firstFileFormat);
    }
  }, [files]);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const blob = item.getAsFile();
          setPastedImage(blob);
          toast.success('Screenshot pasted successfully!');
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    formData.append('targetFormat', targetFormat);
    formData.append('compress', compress);

    try {
      const res = await axios.post('/api/convert', formData, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted-images.zip';
      link.click();
      link.remove();
      toast.success("Images converted & downloaded successfully!");
    } catch (error) {
      toast.error("Conversion failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Image Magic Pro",
              "description": "Convert and compress images to WebP, JPEG, or PNG formats with lossless compression.",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All",
              "url": "https://image-magic-pro.vercel.app/",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
        <header className="w-full py-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Image Magic Pro ✨
          </h1>
          <p className="text-center text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
            Transform your images effortlessly. Convert formats, apply lossless compression, edit screenshots, and more—all in one powerful, free tool. Optimize for web, save space, and enhance your visuals with ease.
          </p>
        </header>

        <nav className="w-full mb-8">
          <div className="flex justify-center space-x-4 bg-gray-800/50 backdrop-blur-md rounded-full p-1 shadow-lg max-w-md mx-auto">
            <button
              onClick={() => setTab('convert')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                tab === 'convert' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              Upload & Convert
            </button>
            <button
              onClick={() => setTab('paste')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                tab === 'paste' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              Paste Screenshot
            </button>
          </div>
        </nav>

        <main className="flex-grow w-full max-w-6xl mx-auto px-6 pb-12">
          {tab === 'convert' && (
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-blue-400">Convert Your Images Seamlessly</h2>
                <p className="text-gray-300 text-lg">
                  Upload single or multiple images, select your desired format (WebP for optimal web performance, JPEG for compatibility, or PNG for transparency), apply optional lossless compression to reduce file sizes without quality loss, and download everything in a convenient ZIP file.
                </p>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-sm font-medium text-gray-400 mb-2 block">Select Files (Supports multiple uploads)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </label>

                {files.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Current Format (Auto-detected)</label>
                        <select disabled className="w-full py-3 px-4 rounded-lg bg-gray-700 text-gray-300 cursor-not-allowed">
                          <option>{currentFormat.toUpperCase()}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Target Format</label>
                        <select
                          className="w-full py-3 px-4 rounded-lg bg-gray-700 text-white"
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value)}
                        >
                          <option value="webp">WebP (Best for web)</option>
                          <option value="jpeg">JPEG (High compatibility)</option>
                          <option value="png">PNG (Supports transparency)</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6 md:pt-0">
                        <input
                          type="checkbox"
                          checked={compress}
                          onChange={(e) => setCompress(e.target.checked)}
                          className="h-5 w-5 accent-blue-600 rounded"
                        />
                        <label className="text-sm text-gray-300 ml-2">Apply Lossless Compression (Reduce size, keep quality)</label>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleConvert}
                  disabled={loading || files.length === 0}
                  className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                    loading || files.length === 0
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {loading ? 'Processing...' : 'Convert & Download ZIP 📦'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="text-2xl mb-2 block">📤</span>
                  <p className="font-semibold">Upload Multiple</p>
                  <p className="text-sm text-gray-400">Handle batches of images at once</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="text-2xl mb-2 block">🔍</span>
                  <p className="font-semibold">Auto-Detect</p>
                  <p className="text-sm text-gray-400">Automatically identifies formats</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="text-2xl mb-2 block">🗜️</span>
                  <p className="font-semibold">Lossless Compress</p>
                  <p className="text-sm text-gray-400">Shrink files without losing quality</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="text-2xl mb-2 block">📥</span>
                  <p className="font-semibold">ZIP Download</p>
                  <p className="text-sm text-gray-400">Get all converted images in one file</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'paste' && pastedImage && (
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50">
              <ScreenshotEditor image={pastedImage} name={pastedName} format={pastedFormat} setFormat={setPastedFormat} setName={setPastedName} />
            </div>
          )}

          {tab === 'paste' && !pastedImage && (
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50 text-center space-y-4">
              <h2 className="text-4xl font-bold text-blue-400">Paste Your Screenshot Here</h2>
              <p className="text-gray-300 text-lg">Simply press Ctrl+V (or Cmd+V on Mac) to paste any image from your clipboard. Edit it with filters, rotations, and save in your preferred format.</p>
              <p className="text-gray-400">Perfect for quick captures from your screen!</p>
            </div>
          )}
        </main>

        <footer className="w-full py-6 text-center text-gray-500 text-sm border-t border-gray-800">
         © 2025 Image Magic Pro. All rights reserved. Built with ❤️ by Bala Vardhan using Next.js.
        </footer>
      </div>
    </>
  );
}