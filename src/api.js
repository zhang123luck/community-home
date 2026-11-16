// ============================================================
// 前端统一请求封装
// - 有后端时：请求 /api（Vite 代理到 http://localhost:3001）
// - 纯静态托管时（GitHub Pages）：走浏览器 localStorage 模拟接口
// ============================================================
import { isStaticMode, handle as localHandle } from './data/localStore'

const BASE = '/api'

async function request(path, { method = 'GET', body, token } = {}) {
  // 静态模式（无后端）：交给本地数据层处理
  if (isStaticMode) {
    return localHandle(method, path, body ?? {}, token)
  }

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (e) {
    throw new Error('无法连接后端服务，请确认已启动 npm run server')
  }

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = null }
  if (!res.ok) throw new Error(data?.error || `请求失败（${res.status}）`)
  return data
}

export const api = {
  get: (p, token) => request(p, { token }),
  post: (p, body, token) => request(p, { method: 'POST', body, token }),
  patch: (p, body, token) => request(p, { method: 'PATCH', body, token }),
  put: (p, body, token) => request(p, { method: 'PUT', body, token }),
  del: (p, token) => request(p, { method: 'DELETE', token })
}

// ---- 后台登录态（存在 sessionStorage，关闭标签页即失效） ----
const TOKEN_KEY = 'admin_token'
export function getToken() { return sessionStorage.getItem(TOKEN_KEY) || '' }
export function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t) }
export function clearToken() { sessionStorage.removeItem(TOKEN_KEY) }
