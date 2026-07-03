# Sender

A lightweight platform to receive messages, reviews, and invoices from users — all managed from a single dashboard.

## Features

- **Inbox (Invoices tab)** — View all messages/invoices sent to you. Click any row to expand and read full messages.
- **Compose replies** — Send Markdown-formatted replies to any user with a built-in editor toolbar (bold, italic, lists).
- **Live Chat** — Real-time WebSocket chat with connected users, peer list, and conversation history.
- **Search & manage** — Filter your inbox by name, email, or message content. Remove users as needed.
- **Dark mode** — Toggle between light and dark themes.
- **Session management** — Lock or log out at any time. Auto-logout when session expires.

## How to Use

1. **Sign up** — Create an account with your username, email, and password.
2. **Get your ID** — Open the settings menu (gear icon) and copy your **User ID**.
3. **Connect your apps** — Use that ID in your other applications (e.g. portfolio site, contact form) so users can send you messages and reviews. The app sending the message just needs to include your user ID with the message content.
4. **Receive & reply** — Messages appear in your inbox. Expand to read, reply via Compose, or chat live.

## Code Example: Sending a Message

Here's how to send a message to your Sender inbox from another app (e.g. a portfolio review form). The backend stores the message and it appears in your dashboard.

```javascript
// Example: sending a review from a portfolio site
const userId = 'YOUR_SENDER_USER_ID'
const response = await fetch('https://url_comming_soon/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    username: 'Jane Doe',
    email: 'jane@example.com',
    content: 'Great portfolio! Loved the projects.',
  }),
})
```

```python
# Python equivalent (e.g. from a Django/Flask backend)
import requests

user_id = 'YOUR_SENDER_USER_ID'
response = requests.post('https://your-backend.com/messages', json={
    'user_id': user_id,
    'username': 'Jane Doe',
    'email': 'jane@example.com',
    'content': 'Great portfolio! Loved the projects.',
})
```

## Example Use Case: Portfolio Review

Add a simple form to your portfolio website. When a visitor submits a review, send a request (from your backend or a service) that includes your Sender user ID and the review content. The review will appear instantly in your Sender inbox alongside any other messages.
