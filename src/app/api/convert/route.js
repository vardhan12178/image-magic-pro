import { NextResponse } from 'next/server';
import sharp from 'sharp';
import JSZip from 'jszip';

export async function POST(req) {
  const formData = await req.formData();
  const files = formData.getAll('files');
  const targetFormat = formData.get('targetFormat') || 'webp';
  const compress = formData.get('compress') === 'true';

  const zip = new JSZip();

  await Promise.all(files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer());

    const image = sharp(buffer);
    if (compress) {
      image.webp({ lossless: true }).jpeg({ quality: 90 }).png({ compressionLevel: 9 });
    }

    const convertedBuffer = await image.toFormat(targetFormat).toBuffer();
    const filename = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;

    zip.file(filename, convertedBuffer);
  }));

  const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

  return new NextResponse(zipContent, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="converted-images.zip"',
    },
  });
}
