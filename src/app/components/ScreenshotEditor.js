"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  RotateCcw,
  RotateCw,
  Download,
  Settings,
  RefreshCw,
  Layers,
} from "lucide-react";
import clsx from "clsx";

export default function ScreenshotEditor({
  image,
  name,
  format,
  setFormat,
  setName,
}) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState("none");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = URL.createObjectURL(image);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = filter;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
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
        toast.success("Image downloaded");
      },
      `image/${format}`
    );
  };

  const handleResetAll = () => {
    setRotation(0);
    setFilter("none");
    setName("screenshot");
    setFormat("png");
  };

  const filters = [
    { name: "Original", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Invert", value: "invert(100%)" },
    { name: "Contrast", value: "contrast(1.4)" },
    { name: "Brighten", value: "brightness(1.2)" },
    { name: "Saturate", value: "saturate(1.5)" },
    { name: "Cool Hue", value: "hue-rotate(180deg)" },
  ];

  return (
    <div className="bg-zinc-900 p-6 md:p-10 border border-zinc-800 rounded-2xl text-white space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Screenshot Editor
        </h2>
        <p className="text-zinc-400 mt-2">Client-side editing (no upload)</p>
      </div>

      <div className="flex justify-center bg-black/40 p-4 rounded-xl border border-zinc-800">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[65vh] rounded-lg border border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-b border-zinc-800 pb-10">
        {/* ROTATION */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" /> Transform
          </h3>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4">
            <button
              onClick={() => setRotation((prev) => prev - 90)}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 flex items-center gap-2 transition"
            >
              <RotateCcw size={18} /> Left
            </button>

            <button
              onClick={() => setRotation((prev) => prev + 90)}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 flex items-center gap-2 transition"
            >
              <RotateCw size={18} /> Right
            </button>
          </div>

          <p className="text-sm text-zinc-500 mt-2 text-center sm:text-left">
            Rotation: <span className="text-indigo-400 font-mono">{rotation}°</span>
          </p>
        </div>

        {/* FILTERS */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings size={18} className="text-indigo-400" /> Filters
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filters.map((f) => (
              <button
                key={f.name}
                onClick={() => setFilter(f.value)}
                className={clsx(
                  "py-2 rounded-md text-xs font-medium border transition-all",
                  filter === f.value
                    ? "bg-indigo-600 border-indigo-400 ring-2 ring-indigo-500/40"
                    : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DOWNLOAD OPTIONS */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Download size={18} className="text-indigo-400" /> Download Options
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-zinc-400">File Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-2 w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <button
            onClick={handleDownload}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold transition flex items-center gap-2 justify-center"
          >
            <Download size={20} /> Download
          </button>

          <button
            onClick={handleResetAll}
            className="px-8 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-full font-semibold transition flex items-center gap-2 justify-center"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
