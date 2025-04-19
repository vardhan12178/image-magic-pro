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

  return (
    <div className="bg-gray-900 p-6 md:p-12 rounded-2xl shadow-xl border border-gray-700 text-center flex flex-col items-center">
      <h2 className="text-2xl font-bold text-pink-400 mb-4">🖼 Edit Your Screenshot</h2>
      <canvas ref={canvasRef} className="mb-4 border border-purple-700 max-w-full max-h-96 rounded-md" />

<div className="w-full max-w-3xl mx-auto space-y-4">

  <div className="flex flex-wrap justify-center gap-3">
    <button onClick={() => setRotation(prev => prev - 90)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">⟲ Rotate Left</button>
    <button onClick={() => setRotation(prev => prev + 90)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">⟳ Rotate Right</button>
  </div>


  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-center">
    <button onClick={() => setFilter('grayscale(100%)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">🖤 B&W</button>
    <button onClick={() => setFilter('sepia(100%)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">📸 Sepia</button>
    <button onClick={() => setFilter('invert(100%)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">🌙 Invert</button>
    <button onClick={() => setFilter('brightness(1.2)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">🌞 Brighten</button>
    <button onClick={() => setFilter('contrast(1.4)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">📺 Contrast</button>
    <button onClick={() => setFilter('saturate(1.5)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">🌈 Saturate</button>
    <button onClick={() => setFilter('hue-rotate(180deg)')} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">🧊 Cool </button>
    <button onClick={() => setFilter('none')} className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded">🔁 Reset</button>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter file name"
      className="px-4 py-2 rounded bg-gray-700 text-white w-full sm:w-1/2"
    />
    <select
      value={format}
      onChange={(e) => setFormat(e.target.value)}
      className="px-4 py-2 rounded bg-gray-700 text-white w-full sm:w-1/2"
    >
      <option value="png">PNG</option>
      <option value="jpeg">JPEG</option>
      <option value="webp">WebP</option>
    </select>
  </div>

 
  <div className="text-center mt-4">
    <button
      onClick={handleDownload}
      className="px-6 py-2 rounded-md font-semibold bg-purple-600 hover:bg-purple-700 transition w-full sm:w-auto"
    >
      Download Screenshot 📷
    </button>
  </div>
</div>

    </div>
  );
}
