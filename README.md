# Legacy Platform Frontend

React frontend for an AI avatar chat interface powered by Simli Client.

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** + **shadcn/ui**
- **Simli Client 3** — AI avatar SDK (video/audio)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve built output |
| `npm run lint` | Run ESLint |

## Environment Variables

Create a `.env` file:

```env
VITE_DEMO_PROFILE_ID=your-profile-uuid
VITE_API_BASE_URL=https://your-api-url
VITE_SIMLI_API_KEY=your-simli-key
```

## Project Structure

```
src/
├── components/
│   ├── SimliChat.jsx   # AI avatar chat interface
│   └── ui/             # shadcn UI primitives
├── lib/
│   └── utils.js        # Shared utilities
├── assets/             # Images
├── App.jsx             # Root component
└── main.jsx            # Entry point
```
