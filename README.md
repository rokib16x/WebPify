# WebPify

Browser-based image converter focused on WebP (and related formats). Convert, compress, and resize images locally — no upload to a third-party server for the conversion itself.

Built by [Rokib](https://rokib.dev).

## Features

- Convert common formats (JPG, PNG, HEIC/HEIF, GIF, BMP, WebP, and more)
- Batch conversion with ZIP download
- Quality / compression controls and optional resize
- Side-by-side original vs converted preview
- Client-side processing for privacy
- Optional conversion counter via Upstash Redis (serverless API)

## Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [heic2any](https://github.com/alexcorvi/heic2any) / related helpers for HEIC
- [JSZip](https://stuk.github.io/jszip/) for batch downloads
- [Upstash Redis](https://upstash.com/) (optional, conversion counter)

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
git clone https://github.com/rokib16x/WebPify.git
cd WebPify
npm install
```

### Develop

```bash
npm run dev
```

### Build & preview

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Configuration

The UI works without Redis. The global conversion counter uses the serverless handler in `api/conversion-count.js` and expects Upstash’s standard env vars (for example on Vercel):

| Variable | Description |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

Copy from your Upstash project dashboard into the host’s environment (or a local `.env` if you wire serverless locally). Do not commit secrets.

## Project layout

```
├── api/                 # Serverless routes (conversion counter)
├── public/              # Static assets
├── src/
│   ├── components/      # UI
│   ├── utils/           # Image processing helpers
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── package.json
```

## Contributing

Issues and pull requests are welcome.

1. Fork the repo and create a branch from `main`
2. Make your changes with a clear commit message
3. Open a PR describing what changed and why

Please keep PRs focused. For larger ideas, open an issue first.

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).

## Acknowledgments

- [WebP](https://developers.google.com/speed/webp) by Google
- Icons by [Lucide](https://lucide.dev/)
