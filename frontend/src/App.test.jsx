import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithRouter } from './test/utils.jsx'

// Mutable auth state so each test can act as admin, member, or logged-out.
const authState = vi.hoisted(() => ({ current: {} }))
vi.mock('./auth/AuthContext.jsx', () => ({ useAuth: () => authState.current }))

// The list pages rendered by App fetch data on mount; stub every call to no-op.
vi.mock('./api.js', () => {
  const list = () => Promise.resolve([])
  return {
    getTickets: vi.fn(list),
    getStatuses: vi.fn(list),
    getPriorities: vi.fn(list),
    getCategories: vi.fn(list),
    getUsers: vi.fn(list),
    getRoles: vi.fn(list),
    getAuthRoles: vi.fn(list),
    deleteTicket: vi.fn(() => Promise.resolve(null)),
  }
})

import App from './App.jsx'

const adminAuth = {
  user: { username: 'admin', fullName: 'Admin', role: { roleName: 'Admin' } },
  isAdmin: true,
  loading: false,
  logout: vi.fn(),
}
const memberAuth = {
  user: { username: 'member', fullName: 'Member', role: { roleName: 'Member' } },
  isAdmin: false,
  loading: false,
  logout: vi.fn(),
}

const masterDataItems = ['Users', 'Statuses', 'Categories', 'Priorities', 'Roles']

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App role gating', () => {
  it('shows the master-data menu to admins', async () => {
    authState.current = adminAuth
    renderWithRouter(<App />, { route: '/tickets' })

    const menu = await screen.findByRole('menu')
    for (const label of masterDataItems) {
      expect(within(menu).getByText(label)).toBeInTheDocument()
    }
    expect(within(menu).getByText('Tickets')).toBeInTheDocument()
  })

  it('hides the master-data menu from non-admins', async () => {
    authState.current = memberAuth
    renderWithRouter(<App />, { route: '/tickets' })

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('Tickets')).toBeInTheDocument()
    for (const label of masterDataItems) {
      expect(within(menu).queryByText(label)).not.toBeInTheDocument()
    }
  })

  it('redirects a non-admin away from an admin-only route', async () => {
    authState.current = memberAuth
    renderWithRouter(<App />, { route: '/users' })

    // The admin route redirects to /tickets, so the ticket list heading shows
    // and no user-management table is rendered.
    expect(await screen.findByRole('heading', { name: 'Tickets' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /new user/i })).not.toBeInTheDocument()
  })

  it('shows the login screen when logged out', async () => {
    authState.current = { user: null, loading: false }
    renderWithRouter(<App />, { route: '/' })

    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows the register screen at /register when logged out', async () => {
    authState.current = { user: null, loading: false }
    renderWithRouter(<App />, { route: '/register' })

    expect(await screen.findByRole('button', { name: /register/i })).toBeInTheDocument()
  })
})
