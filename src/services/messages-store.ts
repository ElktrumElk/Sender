import { reactive } from 'vue'
import { apiGet, apiPostRaw } from './api'

export interface BackendMessage {
  content: string
  username: string
  email: string
  created_at: string
}

export interface Message {
  id: string
  content: string
  sentAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  messages: Message[]
}

export const msgStore = reactive({
  _users: {} as Record<string, User>,
  _seen: {} as Record<string, Set<string>>,
})

export function getUsers(): User[] {
  return Object.values(msgStore._users)
}

export function removeUser(email: string): void {
  delete msgStore._users[email]
  delete msgStore._seen[email]
}

function halfContent(content: string): string {
  return content.slice(0, Math.ceil(content.length / 2))
}

export function lastMessagePreview(user: User): string {
  const msg = user.messages[user.messages.length - 1]
  if (!msg) return '-'
  return halfContent(msg.content) + '...'
}

export function lastMessageTime(user: User): string {
  const msg = user.messages[user.messages.length - 1]
  if (!msg) return '-'
  return formatTime(msg.sentAt)
}

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mergeMessages(data: BackendMessage[]): void {
  for (const item of data) {
    const sig = `${item.content}|${item.created_at}`
    const email = item.email
    let user = msgStore._users[email]
    let seen = msgStore._seen[email]

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        name: item.username,
        email,
        messages: [],
      }
      msgStore._users[email] = user
      seen = new Set()
      msgStore._seen[email] = seen
    }

    if (!seen) {
      seen = new Set()
      msgStore._seen[email] = seen
    }

    if (seen.size === 0 && user.messages.length > 0) {
      for (const msg of user.messages) {
        seen.add(`${msg.content}|${msg.sentAt.toISOString()}`)
      }
    }

    if (seen.has(sig)) continue

    seen.add(sig)
    user.messages.push({
      id: crypto.randomUUID(),
      content: item.content,
      sentAt: new Date(item.created_at),
    })
    user.messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
  }
}

export async function fetchMessages(): Promise<void> {
  const user_id = localStorage.getItem('user_id')
  const data = (await apiGet(`/get_messages?user_id=${user_id}`)) as BackendMessage[]
  mergeMessages(data)
}

export async function sendAdminMessage(
  email: string,
  content: string,
  subject?: string,
): Promise<void> {
  const body: Record<string, string> = { email, content }
  if (subject) body.subject = subject
  const res = await apiPostRaw('/admin/send', body, true)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Send failed')
  }
}

interface Search {
  username: string
}
export async function searchUser (username: string) {
  try {

    const data: Search = await apiGet(`/get_user?username=${username}`) as Search
    return data.username;

  }
  catch (e) {
    console.error('Error:', e)
    alert('User not found');
  }
}
