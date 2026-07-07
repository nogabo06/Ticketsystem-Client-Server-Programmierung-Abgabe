import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../api.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  setToken: vi.fn(),
  getToken: vi.fn(() => null),
}))

import * as api from '../api.js'
import { AuthProvider, useAuth } from './AuthContext.jsx'

// Minimal consumer that surfaces the context and lets tests trigger the actions.
function Consumer() {
  const { user, isAdmin, loading, login, register, logout } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'none'}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => login({ username: 'a', password: 'b' })}>login</button>
      <button onClick={() => register({ username: 'r', password: 'p' })}>register</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

const renderProvider = () => render(<AuthProvider><Consumer /></AuthProvider>)

beforeEach(() => {
  vi.clearAllMocks()
  api.getToken.mockReturnValue(null)
})

describe('AuthContext', () => {
  it('starts logged out when there is no stored token', () => {
    renderProvider()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('login stores the token, sets the user and derives isAdmin', async () => {
    api.login.mockResolvedValue({ token: 'tok', user: { username: 'admin', role: { roleName: 'Admin' } } })
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('admin'))
    expect(screen.getByTestId('admin')).toHaveTextContent('true')
    expect(api.setToken).toHaveBeenCalledWith('tok')
  })

  it('logout clears the user', async () => {
    api.login.mockResolvedValue({ token: 'tok', user: { username: 'bob', role: { roleName: 'Member' } } })
    api.logout.mockResolvedValue(null)
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('bob'))

    await userEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
    expect(api.setToken).toHaveBeenLastCalledWith(null)
  })

  it('register logs the new account in', async () => {
    api.register.mockResolvedValue({ token: 'tok2', user: { username: 'newbie', role: { roleName: 'Member' } } })
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'register' }))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('newbie'))
    expect(screen.getByTestId('admin')).toHaveTextContent('false')
  })

  it('restores the session from a stored token via getMe', async () => {
    api.getToken.mockReturnValue('existing-token')
    api.getMe.mockResolvedValue({ username: 'restored', role: { roleName: 'Member' } })
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('restored'))
    expect(api.getMe).toHaveBeenCalledTimes(1)
  })

  it('drops an invalid stored token if getMe fails', async () => {
    api.getToken.mockReturnValue('stale-token')
    api.getMe.mockRejectedValue(new Error('401'))
    renderProvider()

    await waitFor(() => expect(api.setToken).toHaveBeenCalledWith(null))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })
})
