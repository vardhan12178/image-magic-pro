import { NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";

const SUPPORTED_FORMATS = ["webp", "jpeg", "png"];

const MIME_BY_FORMAT = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
};

function getFormatOptions(targetFormat, compress) {
  if (targetFormat === "webp") {
    return compress ? { lossless: true, effort: 6 } : { quality: 92, effort: 4 };
  }

  if (targetFormat === "jpeg") {
    return compress ? { quality: 82, mozjpeg: true } : { quality: 92 };
  }

  if (targetFormat === "png") {
    return compress
      ? { compressionLevel: 9, adaptiveFiltering: true, palette: true }
      : { compressionLevel: 6 };
  }

  return {};
}

function sanitizeBasename(filename, fallback) {
  const rawBase = filename?.replace(/\.[^/.]+$/, "") || fallback;
  const cleaned = rawBase.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-");
  return cleaned.replace(/^-|-$/g, "") || fallback;
}

function asAttachment(filename) {
  return `attachment; filename="${filename}"`;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");
    const targetFormat = (formData.get("targetFormat") || "webp").toString().toLowerCase();
    const compress = formData.get("compress") === "true";

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (!SUPPORTED_FORMATS.includes(targetFormat)) {
      return NextResponse.json({ error: "Unsupported target format." }, { status: 400 });
    }

    const convertedItems = await Promise.all(
      files.map(async (file, index) => {
        const inputBuffer = Buffer.from(await file.arrayBuffer());
        const safeBase = sanitizeBasename(file.name, `image-${index + 1}`);
        const outputName = `${safeBase}.${targetFormat}`;

        const outputBuffer = await sharp(inputBuffer)
          .rotate()
          .toFormat(targetFormat, getFormatOptions(targetFormat, compress))
          .toBuffer();

        return {
          filename: outputName,
          buffer: outputBuffer,
        };
      })
    );

    if (convertedItems.length === 1) {
      const item = convertedItems[0];
      return new NextResponse(item.buffer, {
        headers: {
          "Content-Type": MIME_BY_FORMAT[targetFormat],
          "Content-Disposition": asAttachment(item.filename),
          "Cache-Control": "no-store",
        },
      });
    }

    const zip = new JSZip();
    convertedItems.forEach((item) => {
      zip.file(item.filename, item.buffer);
    });

    const zipContent = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": asAttachment("converted-images.zip"),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Image conversion failed", error);
    return NextResponse.json({ error: "Conversion failed." }, { status: 500 });
  }
}

