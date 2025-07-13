"use client";
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ScreenshotEditor({ image, name, format, setFormat, setName }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = filter;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      imgRef.current = img;
    };
  }, [image, rotation, filter]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Screenshot downloaded!");
      },
      `image/${format}`
    );
  };

  const handleResetAll = () => {
    setRotation(0);
    setFilter('none');
    setName('screenshot');
    setFormat('png');
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50 text-white">
      <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Edit Your Screenshot 🖼️</h2>
      <p className="text-center text-gray-300 mb-8">Rotate, apply filters, customize name and format, then download your edited image.</p>
      
      <div className="flex justify-center mb-8">
        <canvas ref={canvasRef} className="max-w-full max-h-96 rounded-lg shadow-md border border-gray-600 transition-all duration-300" />
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4 text-center">Rotation Controls</h3>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setRotation(prev => prev - 90)} 
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              ⟲ Rotate Left
            </button>
            <button 
              onClick={() => setRotation(prev => prev + 90)} 
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              ⟳ Rotate Right
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4 text-center">Apply Filters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button 
              onClick={() => setFilter('grayscale(100%)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🖤 B&W
            </button>
            <button 
              onClick={() => setFilter('sepia(100%)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              📸 Sepia
            </button>
            <button 
              onClick={() => setFilter('invert(100%)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🌙 Invert
            </button>
            <button 
              onClick={() => setFilter('brightness(1.2)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🌞 Brighten
            </button>
            <button 
              onClick={() => setFilter('contrast(1.4)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              📺 Contrast
            </button>
            <button 
              onClick={() => setFilter('saturate(1.5)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🌈 Saturate
            </button>
            <button 
              onClick={() => setFilter('hue-rotate(180deg)')} 
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🧊 Cool
            </button>
            <button 
              onClick={() => setFilter('none')} 
              className="py-2 px-4 rounded-lg bg-red-700 hover:bg-red-600 text-white transition-all duration-300 hover:shadow-sm hover:scale-105"
            >
              🔁 Reset Filter
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4 text-center">File Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">File Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter file name"
                className="px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="png">PNG (Supports transparency)</option>
                <option value="jpeg">JPEG (High compatibility)</option>
                <option value="webp">WebP (Optimal for web)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Download Screenshot 📷
          </button>
          <button
            onClick={handleResetAll}
            className="px-6 py-3 rounded-full font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Reset All 🔄
          </button>
        </div>
      </div>
    </div>
  );
}