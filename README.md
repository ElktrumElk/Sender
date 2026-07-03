# Sender

A lightweight frontend-only platform for receiving and managing user messages, sending admin replies, and chatting in real time — no backend server code required on your end.

## Workflow

1. **Sign up / Sign in** — Create an account or log in with your username and password. A JWT token is stored in the session.
2. **Inbox (Invoices tab)** — View a list of users who have sent you messages. Click any row to expand and read all messages from that user.
3. **Send replies** — Click the compose button to open a Markdown editor and send an email-like message to any user.
4. **Live Chat (Chat tab)** — Connect via WebSocket to see online peers, start new conversations, and exchange real-time messages.
5. **Search & manage** — Filter users by name, email, or message content. Delete users from your inbox as needed.
6. **Lock / Logout** — Clear the session at any time via the settings menu.

## Features

- **Authentication** — JWT-based sign up and sign in
- **Message inbox** — Fetch, expand, search, and manage user messages
- **Admin compose** — Send Markdown-formatted emails to users with a toolbar (bold, italic, bullet list, numbered list) and selection wrapping
- **Real-time chat** — WebSocket-based live messaging with peer discovery and conversation history
- **Dark mode** — Toggle light/dark theme, persisted to `localStorage`
- **Responsive layout** — CSS Grid layout adapts to screen size
- **Session management** — Auto-logout on token expiry (401)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript (strict) |
| Build | Vite 8 |
| State | Pinia 3 |
| Routing | Vue Router 5 |
| Linting | ESLint 10 + oxlint + Prettier |
| Unit tests | Vitest 4 + jsdom |
| E2E tests | Playwright 1.61 |

## Prerequisites

- Node.js `^22.18.0 \|\| >=24.12.0`
- A running backend server (default: `http://localhost:8090`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Set the backend URL in `.env`:

```
VITE_BASE_URL=http://localhost:8090
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check with `vue-tsc`, then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Lint with oxlint and ESLint |
| `npm run format` | Format with Prettier |

## API Endpoints (expected by the frontend)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Authenticate and receive JWT |
| GET | `/get_messages?user_id=...` | Fetch messages for a user |
| POST | `/admin/send` | Send an admin email |
| GET | `/get_user?username=...` | Search for a user |
| GET | `/conversations` | List chat peers |
| GET | `/conversations/:peer` | Load chat history with a peer |
| WS | `/ws` | WebSocket endpoint for live chat |
