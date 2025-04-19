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

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => setTab('convert')} className={`px-4 py-2 rounded-md font-medium ${tab === 'convert' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Upload & Convert</button>
          <button onClick={() => setTab('paste')} className={`px-4 py-2 rounded-md font-medium ${tab === 'paste' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Paste Screenshot</button>
        </div>

        <div className="min-h-[80vh]">
          {tab === 'convert' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-12 h-full flex flex-col justify-center scroll-mt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-5 text-left">
                  <h2 className="text-4xl font-bold text-pink-400 animate-fade-in-down">🎉 Welcome to <span className="underline decoration-purple-500">Image Magic Pro</span>!</h2>
                  <p className="text-gray-300 text-lg">
                    Easily convert images to <strong>WebP, JPEG, or PNG</strong>, apply <strong>lossless compression</strong>, and download them instantly as a ZIP file.
                  </p>
                  <ul className="text-sm md:text-base text-gray-300 space-y-2 pl-4 list-disc list-inside">
                    <li className="text-green-400">Upload multiple images at once</li>
                    <li className="text-green-400">Auto-detect current image formats</li>
                    <li className="text-green-400">Lossless compression (optional)</li>
                    <li className="text-green-400">Download results as a .zip file</li>
                  </ul>
                </div>

                <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-xl shadow-xl border border-purple-800">
                  <h3 className="text-xl font-semibold mb-4 text-purple-300">⚙️ Convert Your Images</h3>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="block w-full mb-4 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />

                  {files.length > 0 && (
                    <>
                      <div className="grid gap-4 mb-3">
                        <select disabled className="w-full py-2 px-3 rounded bg-gray-700 text-gray-400">
                          <option>{currentFormat.toUpperCase()}</option>
                        </select>
                        <select className="w-full py-2 px-3 rounded bg-gray-700" value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
                          <option value="webp">WebP</option>
                          <option value="jpeg">JPEG</option>
                          <option value="png">PNG</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          checked={compress}
                          onChange={(e) => setCompress(e.target.checked)}
                          className="accent-purple-600 h-4 w-4"
                        />
                        <label className="text-sm">Apply Lossless Compression</label>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleConvert}
                    disabled={loading || files.length === 0}
                    className={`w-full py-2 rounded-md font-semibold transition-transform duration-200 ${
                      loading || files.length === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Convert & Download ZIP 📂'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'paste' && pastedImage && (
            <ScreenshotEditor image={pastedImage} name={pastedName} format={pastedFormat} setFormat={setPastedFormat} setName={setPastedName} />
          )}

          {tab === 'paste' && !pastedImage && (
            <div className="bg-gray-900 p-6 md:p-12 rounded-2xl shadow-xl border border-gray-700 h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-pink-400 mb-4">👍 Paste Your Screenshot (Ctrl+V)</h2>
              <p className="text-gray-400">Take a screenshot and press Ctrl+V to paste here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
