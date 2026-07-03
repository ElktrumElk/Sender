import { reactive } from 'vue'

export const api = reactive({
  baseUrl: import.meta.env.VITE_BASE_URL,
  token: ''
})

export function setToken(token: string) {
  api.token = token
}

export function clearToken() {
  api.token = ''
}

export async function apiPost(path: string, body: unknown, auth = false): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth && api.token) headers['Authorization'] = `Bearer ${api.token}`
  const res = await fetch(`${api.baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  if (res.status === 401) throw new Error('Unauthorized')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  return res.json()
}

export async function apiGet(path: string): Promise<unknown> {
  const headers: Record<string, string> = {}
  if (api.token) headers['Authorization'] = `Bearer ${api.token}`
  const res = await fetch(`${api.baseUrl}${path}`, { headers })
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 404) throw new Error('Not found')
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function apiPostRaw(path: string, body: unknown, auth = false): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth && api.token) headers['Authorization'] = `Bearer ${api.token}`
  return fetch(`${api.baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
}
