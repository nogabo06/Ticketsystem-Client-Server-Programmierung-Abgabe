const BASE = 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'

// Guarded access so importing this module works outside a browser (e.g. unit
// tests running in a non-DOM environment where localStorage is unavailable or
// only partially implemented).
const storage =
  typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
    ? localStorage
    : null

// The bearer token is kept in localStorage so a page reload keeps you logged in.
let authToken = storage ? storage.getItem(TOKEN_KEY) : null

export function setToken(token) {
  authToken = token
  if (!storage) return
  if (token) storage.setItem(TOKEN_KEY, token)
  else storage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return authToken
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // A 401 means the session is gone/expired — drop the token and let the app
  // fall back to the login screen.
  if (res.status === 401) {
    setToken(null)
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'))
  }
  if (res.status === 204) return null
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Auth
export const getAuthRoles = () => request('/auth/roles')
export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) })
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) })
export const logout = () => request('/auth/logout', { method: 'POST' })
export const getMe = () => request('/auth/me')

// Builds a query string, repeating the key for array values (e.g. { assignee: [1, 2] }
// -> "assignee=1&assignee=2") so it matches the backend's JAX-RS List<T> query params.
function buildQuery(params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (!value.length) continue
      value.forEach((v) => qs.append(key, v))
    } else {
      qs.append(key, value)
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

// Tickets
export const getTickets = (params) => request(`/tickets${params ? buildQuery(params) : ''}`)
export const getNextTicketNo = () => request('/tickets/next-number')
export const getTicket = (id) => request(`/tickets/${id}`)
export const getTicketByNumber = (no) => request(`/tickets/number/${no}`)
export const createTicket = (data) => request('/tickets', { method: 'POST', body: JSON.stringify(data) })
export const updateTicket = (id, data) => request(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteTicket = (id) => request(`/tickets/${id}`, { method: 'DELETE' })

// Comments
export const getComments = (ticketId) => request(`/tickets/${ticketId}/comments`)
// The comment author is taken from the logged-in session on the backend, so the
// payload only carries the text.
export const addComment = (ticketId, data) => request(`/tickets/${ticketId}/comments`, { method: 'POST', body: JSON.stringify(data) })
export const deleteComment = (ticketId, commentId) => request(`/tickets/${ticketId}/comments/${commentId}`, { method: 'DELETE' })

// Assignment history
export const getAssignmentHistory = (ticketId) => request(`/tickets/${ticketId}/assignment-history`)

// Users
export const getUsers = () => request('/users')
export const getUser = (id) => request(`/users/${id}`)
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) })
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' })

// Statuses
export const getStatuses = () => request('/statuses')
export const getStatus = (id) => request(`/statuses/${id}`)
export const createStatus = (data) => request('/statuses', { method: 'POST', body: JSON.stringify(data) })
export const updateStatus = (id, data) => request(`/statuses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteStatus = (id) => request(`/statuses/${id}`, { method: 'DELETE' })

// Categories
export const getCategories = () => request('/categories')
export const getCategory = (id) => request(`/categories/${id}`)
export const createCategory = (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) })
export const updateCategory = (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' })

// Priorities
export const getPriorities = () => request('/priorities')
export const getPriority = (id) => request(`/priorities/${id}`)
export const createPriority = (data) => request('/priorities', { method: 'POST', body: JSON.stringify(data) })
export const updatePriority = (id, data) => request(`/priorities/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePriority = (id) => request(`/priorities/${id}`, { method: 'DELETE' })

// Roles
export const getRoles = () => request('/roles')
export const getRole = (id) => request(`/roles/${id}`)
export const createRole = (data) => request('/roles', { method: 'POST', body: JSON.stringify(data) })
export const updateRole = (id, data) => request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteRole = (id) => request(`/roles/${id}`, { method: 'DELETE' })
