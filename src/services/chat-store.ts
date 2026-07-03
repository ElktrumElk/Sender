import { reactive } from 'vue'
import { api } from './api'
import { apiGet } from './api'

export interface ChatMessage {
  id: string
  from: string
  content: string
  createdAt: Date
  isMine: boolean
}

interface WsMessage {
  type: string
  from?: string
  to?: string
  content?: string
  created_at?: string
  status?: string
  username?: string
  error?: string
}

function wsUrl(): string {
  return api.baseUrl.replace(/^http/, 'ws') + '/ws'
}

export const chatStore = reactive({
  ws: null as WebSocket | null,
  connected: false,
  wsError: '',
  username: '',
  peers: [] as string[],
  activePeer: '',
  messages: [] as ChatMessage[]
})

export function wsConnect(username: string): void {
  chatStore.username = username
  chatStore.connected = false
  chatStore.wsError = ''
  chatStore.ws = new WebSocket(wsUrl())

  chatStore.ws.onopen = () => {
    chatStore.ws!.send(JSON.stringify({ type: 'auth', username }))
  }

  chatStore.ws.onmessage = (event) => {
    const data: WsMessage = JSON.parse(event.data)
    handleWsMessage(data)
  }

  chatStore.ws.onclose = () => {
    chatStore.connected = false
    chatStore.ws = null
  }

  chatStore.ws.onerror = () => {
    chatStore.connected = false
  }
}

export function wsConnectWithToken(token: string): void {
  chatStore.connected = false
  chatStore.ws = new WebSocket(wsUrl())

  chatStore.ws.onopen = () => {
    chatStore.ws!.send(JSON.stringify({ type: 'token_auth', token }))
  }

  chatStore.ws.onmessage = (event) => {
    const data: WsMessage = JSON.parse(event.data)
    if (data.type === 'auth_ok' && data.username) {
      chatStore.username = data.username
    }
    handleWsMessage(data)
  }

  chatStore.ws.onclose = () => {
    chatStore.connected = false
    chatStore.ws = null
  }

  chatStore.ws.onerror = () => {
    chatStore.connected = false
  }
}

export function wsDisconnect(): void {
  chatStore.ws?.close()
  chatStore.ws = null
  chatStore.connected = false
  chatStore.username = ''
  chatStore.messages = []
  chatStore.activePeer = ''
}

export function wsSendMessage(to: string, content: string): void {
  if (!chatStore.ws || !chatStore.connected) return
  chatStore.ws.send(JSON.stringify({ type: 'message', to, content }))
}

function handleWsMessage(data: WsMessage): void {
  if (data.type === 'error' && data.error) {
    chatStore.wsError = data.error
    return
  }

  if (data.type === 'auth_ok') {
    chatStore.connected = true
    chatStore.wsError = ''
    return
  }

  if (data.type === 'message') {
    if (data.status === 'sent') return

    const from = data.from || ''
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      from,
      content: data.content || '',
      createdAt: new Date(data.created_at || Date.now()),
      isMine: from === chatStore.username
    }
    chatStore.messages.push(msg)

    if (!chatStore.peers.includes(from) && from !== chatStore.username) {
      chatStore.peers.unshift(from)
    }
  }
}

export async function loadConversations(): Promise<void> {
  const data = await apiGet('/conversations')
  chatStore.peers = data as string[]
}

export async function loadConversationHistory(username: string, peer: string): Promise<void> {
  const data = await apiGet(
    `/conversations/${encodeURIComponent(peer)}`
  ) as { sender: string; receiver: string; content: string; created_at: string }[]
  chatStore.messages = data.map(item => ({
    id: crypto.randomUUID(),
    from: item.sender,
    content: item.content,
    createdAt: new Date(item.created_at),
    isMine: item.sender === username
  }))
}
