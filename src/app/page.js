"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  UploadCloud,
  Zap,
  X,
  Download,
  FileText,
  Layers,
} from "lucide-react";
import clsx from "clsx";

const ScreenshotEditor = dynamic(
  () => import("./components/ScreenshotEditor"),
  { ssr: false }
);

export default function Home() {
  const [tab, setTab] = useState("convert");
  const [files, setFiles] = useState([]);
  const [currentFormat, setCurrentFormat] = useState("");
  const [targetFormat, setTargetFormat] = useState("webp");
  const [compress, setCompress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [pastedFormat, setPastedFormat] = useState("png");
  const [pastedName, setPastedName] = useState("screenshot");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (newFiles) => {
    const incoming = newFiles instanceof FileList ? Array.from(newFiles) : newFiles;
    setFiles(incoming);
    if (incoming.length) {
      setCurrentFormat(incoming[0].type.split("/")[1] || "image");
    }
  };

  const clearFiles = () => setFiles([]);

  const downloadText = useMemo(() => {
    if (loading) return "Processing...";
    if (files.length > 1) return `Download ZIP (${files.length})`;
    if (files.length === 1)
      return `Download ${files[0].name.split(".")[0]}.${targetFormat}`;
    return "Select Files to Start";
  }, [files, loading, targetFormat]);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const blob = item.getAsFile();
          setPastedImage(blob);
          toast.success("Screenshot pasted!");
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleConvert = async () => {
    if (!files.length || loading) return;
    setLoading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("targetFormat", targetFormat);
    formData.append("compress", compress);

    const filename =
      files.length > 1
        ? "converted.zip"
        : files[0].name.split(".")[0] + `.${targetFormat}`;

    try {
      const res = await axios.post("/api/convert", formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      link.remove();

      toast.success("Done!");
      clearFiles();
    } catch {
      toast.error("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <>
      <Head>
        <title>Image Magic Pro</title>
      </Head>

      <div className="min-h-screen bg-black text-zinc-200 flex flex-col">
        <header className="py-6 text-center border-b border-zinc-800">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
           Image Magic Pro
          </h1>
          <p className="text-zinc-400 mt-4 px-4">
            Simple. Fast. Built for your daily workflow.
          </p>
        </header>

        <nav className="mt-6 mb-8">
          <div className="flex justify-center max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-full p-2 gap-2">
            <button
              onClick={() => setTab("convert")}
              className={clsx(
                "flex-1 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2",
                tab === "convert"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <Layers size={16} /> Upload
            </button>

            <button
              onClick={() => setTab("paste")}
              className={clsx(
                "flex-1 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2",
                tab === "paste"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <Zap size={16} /> Paste
            </button>
          </div>
        </nav>

        <main className="flex-grow max-w-4xl mx-auto px-4 w-full pb-12">
          {/* UPLOAD TAB */}
          {tab === "convert" && (
            <div className="bg-zinc-900 p-5 md:p-8 rounded-2xl border border-zinc-800 space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                  "relative p-10 text-center rounded-xl border-2 border-dashed transition-all",
                  isDragOver
                    ? "border-indigo-500 bg-indigo-900/20"
                    : "border-zinc-700 hover:border-indigo-500"
                )}
              >
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="absolute inset-0 opacity-0"
                />
                <UploadCloud className="mx-auto h-12 w-12 text-indigo-400 mb-3" />
                <p className="font-semibold">
                  {isDragOver ? "Drop files…" : "Click or Drag files here"}
                </p>
                <p className="text-sm text-zinc-500">PNG / JPG / WebP</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                      <span>{files.length} file(s)</span>
                      <button
                        onClick={clearFiles}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        Clear <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                      {files.map((file, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-xs"
                        >
                          <FileText size={12} className="text-indigo-400" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400">Source</label>
                      <input
                        disabled
                        value={currentFormat.toUpperCase()}
                        className="w-full py-2 px-3 mt-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400">Convert To</label>
                      <select
                        className="w-full py-2 px-3 mt-1 rounded-lg bg-zinc-950 border border-zinc-800"
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value)}
                      >
                        <option value="webp">WebP</option>
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={compress}
                        onChange={(e) => setCompress(e.target.checked)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="text-sm text-zinc-300">
                        Lossless Compression
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={loading || files.length === 0}
                    className={clsx(
                      "w-full py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all",
                      loading || files.length === 0
                        ? "bg-zinc-800 text-zinc-500"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    )}
                  >
                    {downloadText} <Download size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASTE TAB */}
          {tab === "paste" && (
            <div className="bg-zinc-900 p-6 md:p-10 rounded-2xl border border-zinc-800">
              {pastedImage ? (
                <ScreenshotEditor
                  image={pastedImage}
                  name={pastedName}
                  format={pastedFormat}
                  setFormat={setPastedFormat}
                  setName={setPastedName}
                />
              ) : (
                <div className="text-center p-10 md:p-20 border-2 border-dashed border-indigo-600 rounded-xl bg-zinc-950">
                  <h2 className="text-3xl font-bold text-indigo-400">
                    Paste Screenshot
                  </h2>
                  <p className="text-zinc-400 mt-3">
                    Press <span className="bg-zinc-700 px-2 py-1 rounded">Ctrl+V</span> to paste
                    from clipboard.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="py-6 text-center text-zinc-600 text-sm border-t border-zinc-800">
          © {new Date().getFullYear()} Media Optimizer.
        </footer>
      </div>
    </>
  );
}
