import { apiPost, setToken } from './api'

export interface SignupResult {
  message: string
  username: string
  user_id: string
}

export interface LoginResult {
  token: string
  user: { id: number; username: string; email: string, user_id: string }
}

export async function signup(username: string, password: string, email: string): Promise<SignupResult> {
  return await apiPost('/signup', { username, email, password }) as SignupResult
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const data = await apiPost('/login', { username, password }) as LoginResult
  setToken(data.token)
  return data
}
