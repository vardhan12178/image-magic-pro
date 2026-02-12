# Image Magic Pro

Image Magic Pro is a modern web app for quick image conversion and local screenshot editing.

## Features

- Convert PNG, JPEG, and WebP files
- Batch conversion with ZIP download for multiple files
- Single file direct download with correct output extension
- Optional optimization mode for smaller output files
- Clipboard screenshot editor (runs in the browser)
- Rotation, filters, filename control, and export format selection
- Visual conversion progress bar while processing

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- `sharp` for server-side image conversion
- `jszip` for batch ZIP output

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run the development server

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run lint checks

## How Conversion Works

1. Upload one or more images from the Convert tab.
2. Choose target format (`WEBP`, `JPEG`, `PNG`) and optimization mode.
3. Click download/convert.
4. Receive:
	- one converted image for a single input, or
	- a ZIP containing all converted files for batch input.

## API

### `POST /api/convert`

#### FormData fields

- `files`: one or more image files
- `targetFormat`: `webp` | `jpeg` | `png`
- `compress`: `true` | `false`

#### Responses

- `200 image/*` for single-file conversion
- `200 application/zip` for multi-file conversion
- `400` for bad input
- `500` for server conversion errors

## Notes

- The screenshot editor operations happen in-browser on canvas.
- Conversion endpoint uses `sharp`, so Node runtime support is required.
- If favicon changes do not appear immediately, do a hard refresh (`Ctrl+F5`).
