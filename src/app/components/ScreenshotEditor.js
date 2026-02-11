"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import {
  Download,
  RefreshCw,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";

const FILTERS = [
  { name: "Original", value: "none" },
  { name: "Mono", value: "grayscale(100%)" },
  { name: "Warm", value: "sepia(80%) saturate(120%)" },
  { name: "High Contrast", value: "contrast(1.35)" },
  { name: "Bright", value: "brightness(1.15)" },
  { name: "Cool", value: "hue-rotate(165deg) saturate(120%)" },
  { name: "Film", value: "contrast(1.15) sepia(28%)" },
  { name: "Invert", value: "invert(100%)" },
];

function normalizeRotation(degrees) {
  return ((degrees % 360) + 360) % 360;
}

export default function ScreenshotEditor({ image, name, format, setFormat, setName }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState("none");
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const objectUrl = URL.createObjectURL(image);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      const normalized = normalizeRotation(rotation);
      const radians = (normalized * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      const width = Math.ceil(img.width * cos + img.height * sin);
      const height = Math.ceil(img.width * sin + img.height * cos);

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.filter = filter;
      ctx.translate(width / 2, height / 2);
      ctx.rotate(radians);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      setImageMeta({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Could not render pasted image.");
    };
  }, [image, rotation, filter]);

  const displayedRotation = useMemo(() => normalizeRotation(rotation), [rotation]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Export failed.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${name || "capture"}.${format}`;
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded");
      },
      `image/${format}`
    );
  };

  const resetAll = () => {
    setRotation(0);
    setFilter("none");
    setName("capture");
    setFormat("png");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-space text-2xl font-semibold text-white">Screenshot Editor</h2>
          <p className="mt-1 text-sm text-slate-300">Everything below runs in your browser.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
          {imageMeta.width} x {imageMeta.height} px
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3">
        <div className="flex items-center justify-center rounded-xl border border-white/5 bg-slate-900/80 p-2 sm:p-4">
          <canvas ref={canvasRef} className="max-h-[62vh] max-w-full rounded-lg border border-white/10" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-100">
            <SlidersHorizontal size={15} className="text-cyan-200" />
            Transform
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRotation((current) => current - 90)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              <RotateCcw size={14} />
              Left
            </button>
            <button
              type="button"
              onClick={() => setRotation((current) => current + 90)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              <RotateCw size={14} />
              Right
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">Rotation: {displayedRotation} deg</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="mb-3 text-sm font-medium text-slate-100">Filters</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FILTERS.map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => setFilter(entry.value)}
                className={clsx(
                  "rounded-lg border px-2 py-1.5 text-xs transition",
                  filter === entry.value
                    ? "border-cyan-300 bg-cyan-500/15 text-cyan-100"
                    : "border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700"
                )}
              >
                {entry.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Filename</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
            />
          </label>

          <label>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Format</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Download size={15} />
            Download
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            <RefreshCw size={15} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

