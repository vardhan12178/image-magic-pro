"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  Globe2,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  WandSparkles,
} from "lucide-react";

const ScreenshotEditor = dynamic(() => import("./components/ScreenshotEditor"), {
  ssr: false,
});

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const TARGET_FORMATS = ["webp", "jpeg", "png"];

const HIGHLIGHTS = [
  { label: "Supported formats", value: "PNG, JPEG, WebP" },
  { label: "Batch export", value: "ZIP download for multiple files" },
  { label: "Privacy mode", value: "Screenshot editing runs in your browser" },
];

const FEATURES = [
  {
    title: "High-speed conversion",
    description: "Batch convert PNG, JPEG, and WebP with production-tuned output settings.",
    icon: Gauge,
  },
  {
    title: "Privacy-first screenshot editing",
    description: "Clipboard edits run directly in your browser with no upload required.",
    icon: Lock,
  },
  {
    title: "Built for global teams",
    description: "Consistent outputs for engineering, product, support, and marketing workflows.",
    icon: Globe2,
  },
  {
    title: "Simple adoption",
    description: "No account friction. Open, drop files, export, and continue your workflow.",
    icon: Users,
  },
];

const STEPS = [
  {
    title: "Drop images or paste a screenshot",
    body: "Start with file upload for batch conversion or use clipboard mode for quick edits.",
  },
  {
    title: "Choose output settings",
    body: "Select target format and optimization profile based on quality or file-size priority.",
  },
  {
    title: "Export instantly",
    body: "Single files download directly. Multi-file jobs are packaged into a ready ZIP archive.",
  },
];

const cardAnimation = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" },
};

function formatBytes(bytes) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value.toFixed(power === 0 ? 0 : 1)} ${units[power]}`;
}

function filenameFromDisposition(header) {
  if (!header) {
    return null;
  }

  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const simpleMatch = header.match(/filename="?([^";]+)"?/i);
  return simpleMatch?.[1] || null;
}

function isAcceptedFile(file) {
  if (ACCEPTED_TYPES.includes(file.type)) {
    return true;
  }

  const extension = file.name?.split(".")?.pop()?.toLowerCase();
  return extension ? ACCEPTED_EXTENSIONS.includes(extension) : false;
}

async function getAxiosErrorMessage(error) {
  const fallback = "Conversion failed";
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const mimeType = data.type || "";
    if (mimeType.includes("application/json") || mimeType.includes("text/")) {
      try {
        const parsed = JSON.parse(await data.text());
        return parsed?.error || fallback;
      } catch {
        return fallback;
      }
    }
  }

  if (typeof data === "object" && data?.error) {
    return data.error;
  }

  return fallback;
}

export default function Home() {
  const [tab, setTab] = useState("convert");
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [compress, setCompress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pastedImage, setPastedImage] = useState(null);
  const [pastedFormat, setPastedFormat] = useState("png");
  const [pastedName, setPastedName] = useState("capture");
  const [isDragOver, setIsDragOver] = useState(false);

  const currentFormat = useMemo(() => {
    if (!files.length) {
      return "-";
    }

    const first = files[0]?.type?.split("/")?.[1];
    return first ? first.toUpperCase() : "IMAGE";
  }, [files]);

  const downloadText = useMemo(() => {
    if (loading) {
      return "Processing";
    }

    if (!files.length) {
      return "Select files";
    }

    if (files.length > 1) {
      return `Download ZIP (${files.length})`;
    }

    const base = files[0].name.replace(/\.[^/.]+$/, "");
    return `Download ${base}.${targetFormat}`;
  }, [files, loading, targetFormat]);

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + (file.size || 0), 0),
    [files]
  );

  const setIncomingFiles = (incomingFiles) => {
    const list = incomingFiles instanceof FileList ? Array.from(incomingFiles) : incomingFiles;
    const valid = list.filter((file) => isAcceptedFile(file));

    if (!valid.length) {
      toast.error("Use PNG, JPEG, or WebP files.");
      return;
    }

    if (valid.length !== list.length) {
      toast("Some files were skipped due to unsupported format.", { icon: "!" });
    }

    setFiles(valid);
  };

  const clearFiles = () => setFiles([]);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            setPastedImage(blob);
            toast.success("Screenshot pasted");
            setTab("paste");
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleConvert = async () => {
    if (!files.length || loading) {
      return;
    }

    let progressTimer;
    setLoading(true);
    setProgress(8);

    progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + 3));
    }, 200);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("targetFormat", targetFormat);
      formData.append("compress", String(compress));

      const response = await axios.post("/api/convert", formData, {
        responseType: "blob",
        onUploadProgress: (event) => {
          if (!event.total) {
            return;
          }

          const uploadedPercent = Math.round((event.loaded / event.total) * 55);
          setProgress((current) => Math.max(current, Math.min(uploadedPercent, 60)));
        },
        onDownloadProgress: (event) => {
          if (!event.total) {
            return;
          }

          const downloadPercent = 60 + Math.round((event.loaded / event.total) * 35);
          setProgress((current) => Math.max(current, Math.min(downloadPercent, 95)));
        },
      });

      const disposition = response.headers["content-disposition"];
      const fallbackName =
        files.length > 1
          ? "converted-images.zip"
          : `${files[0].name.replace(/\.[^/.]+$/, "")}.${targetFormat}`;
      const filename = filenameFromDisposition(disposition) || fallbackName;

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setProgress(100);
      toast.success("Conversion complete");
      clearFiles();
    } catch (error) {
      const message = await getAxiosErrorMessage(error);
      toast.error(message);
    } finally {
      window.clearInterval(progressTimer);
      setLoading(false);
      window.setTimeout(() => setProgress(0), 250);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 md:pt-10">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur-xl"
        >
          <a href="#" className="inline-flex items-center gap-2 font-space text-lg font-semibold text-white">
            <Sparkles size={17} className="text-cyan-200" />
            Image Magic Pro
          </a>
          <div className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#app" className="hover:text-white">Try Tool</a>
          </div>
          <a
            href="#app"
            className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open App
          </a>
        </motion.nav>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className="mt-6 rounded-3xl border border-white/10 bg-slate-900/75 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
                <Sparkles size={14} />
                Image conversion and screenshot editing
              </span>
              <h1 className="mt-4 font-space text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                A focused image tool for everyday work.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Convert and optimize assets, then edit clipboard screenshots instantly for release notes, tickets, and docs.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#app"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Start Converting
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  View Workflow
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">What you can do here</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-200">
                Convert one or many images to your target format.
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-200">
                Export a single file directly or receive a ZIP for batches.
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-200">
                Paste screenshots and edit locally before download.
              </div>
            </div>
          </div>
        </motion.section>

        <section id="features" className="mt-6 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"
              >
                <div className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2.5 text-cyan-100">
                  <Icon size={18} />
                </div>
                <h2 className="mt-4 font-space text-2xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
              </motion.article>
            );
          })}
        </section>

        <section id="workflow" className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">How it works</p>
              <h2 className="mt-2 font-space text-3xl font-semibold text-white sm:text-4xl">A workflow your team can use in minutes</h2>
            </div>
            <a href="#app" className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5">
              Open the app section
            </a>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="app" className="mt-6 rounded-3xl border border-white/10 bg-slate-900/72 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">App workspace</p>
              <h2 className="mt-1 font-space text-2xl font-semibold text-white sm:text-3xl">Convert and edit right here</h2>
            </div>
            <p className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
              Workspace
            </p>
          </div>

          <div className="mt-6 flex w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => setTab("convert")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                tab === "convert" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-white/5"
              )}
            >
              <Layers size={16} />
              Convert
            </button>
            <button
              type="button"
              onClick={() => setTab("paste")}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                tab === "paste" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-white/5"
              )}
            >
              <WandSparkles size={16} />
              Screenshot Editor
            </button>
          </div>

          <section className="mt-4">
            <AnimatePresence mode="wait">
              {tab === "convert" ? (
                <motion.div key="convert" {...cardAnimation} className="space-y-4">
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsDragOver(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragOver(false);
                      if (event.dataTransfer.files?.length) {
                        setIncomingFiles(event.dataTransfer.files);
                      }
                    }}
                    className={clsx(
                      "group relative rounded-3xl border border-dashed p-8 transition sm:p-12",
                      isDragOver
                        ? "border-cyan-300 bg-cyan-500/10"
                        : "border-slate-600/70 bg-slate-900/70 hover:border-cyan-400/70"
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={(event) => setIncomingFiles(event.target.files)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />

                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-200">
                        <UploadCloud size={28} />
                      </div>
                      <h3 className="mt-4 font-space text-2xl font-semibold text-white">Upload images</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Drag files here or click to browse. Batch conversion is supported.
                      </p>
                      <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-slate-300">
                        <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1">PNG</span>
                        <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1">JPEG</span>
                        <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1">WebP</span>
                      </div>
                    </div>
                  </div>

                  {files.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-sm sm:p-6"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 size={16} className="text-emerald-300" />
                          {files.length} file(s) selected - {formatBytes(totalSize)}
                        </div>
                        <button
                          type="button"
                          onClick={clearFiles}
                          className="inline-flex items-center gap-2 rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          Clear
                        </button>
                      </div>

                      <div className="max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                        {files.map((file) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-900/90 px-3 py-2 text-sm"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <FileText size={15} className="shrink-0 text-cyan-200" />
                              <p className="truncate text-slate-100">{file.name}</p>
                            </div>
                            <span className="shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Source</p>
                          <p className="mt-2 text-lg font-medium text-white">{currentFormat}</p>
                        </div>

                        <label className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Convert To</p>
                          <select
                            value={targetFormat}
                            onChange={(event) => setTargetFormat(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
                          >
                            {TARGET_FORMATS.map((option) => (
                              <option key={option} value={option}>
                                {option.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Optimization</p>
                            <p className="mt-2 text-sm text-slate-100">Smaller output files</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={compress}
                            onChange={(event) => setCompress(event.target.checked)}
                            className="h-5 w-5 rounded border-white/20 bg-slate-800 accent-cyan-400"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleConvert}
                        disabled={loading || files.length === 0}
                        className={clsx(
                          "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition",
                          loading || files.length === 0
                            ? "cursor-not-allowed border border-white/10 bg-slate-800 text-slate-500"
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        )}
                      >
                        <Download size={17} />
                        {downloadText}
                        {!loading && <ArrowRight size={16} />}
                      </button>

                      {loading ? (
                        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                            <span>Converting images...</span>
                            <span>{Math.max(1, Math.min(100, progress))}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-cyan-400 transition-[width] duration-200 ease-out"
                              style={{ width: `${Math.max(1, Math.min(100, progress))}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  key="paste"
                  {...cardAnimation}
                  className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6"
                >
                  {pastedImage ? (
                    <ScreenshotEditor
                      image={pastedImage}
                      name={pastedName}
                      format={pastedFormat}
                      setFormat={setPastedFormat}
                      setName={setPastedName}
                    />
                  ) : (
                    <div className="rounded-3xl border border-dashed border-cyan-300/50 bg-slate-950/70 px-6 py-16 text-center sm:px-12">
                      <div className="mx-auto w-fit rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-cyan-200">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="mt-4 font-space text-2xl font-semibold text-white">Clipboard editor is ready</h3>
                      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300 sm:text-base">
                        Press <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs">Ctrl+V</span> to paste a screenshot and edit it locally.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/20 to-emerald-500/15 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Want to use the tool now?</p>
              <h2 className="mt-2 font-space text-3xl font-semibold text-white">Open the workspace and start converting</h2>
              <p className="mt-2 text-sm text-slate-200">Upload files or paste a screenshot to begin.</p>
            </div>
            <a
              href="#app"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Open Workspace
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Image Magic Pro</p>
          <div className="flex gap-4">
            <span>Add policy/support links before public launch.</span>
            <a href="#app" className="hover:text-slate-200">Product</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
