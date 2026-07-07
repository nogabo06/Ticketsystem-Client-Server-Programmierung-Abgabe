import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

const authState = vi.hoisted(() => ({ login: vi.fn() }))
vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => ({ login: authState.login }) }))

import Login from './Login.jsx'

beforeEach(() => {
  vi.clearAllMocks()
  authState.login.mockResolvedValue({ userId: 1 })
})

describe('Login', () => {
  it('submits the entered credentials', async () => {
    renderWithRouter(<Login />)

    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(authState.login).toHaveBeenCalledTimes(1))
    expect(authState.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' })
  })

  it('shows an error toast when login fails', async () => {
    authState.login.mockRejectedValue(new Error('Invalid username or password'))
    const error = vi.spyOn(message, 'error').mockImplementation(() => {})
    renderWithRouter(<Login />)

    await userEvent.type(screen.getByLabelText('Username'), 'alice')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(error).toHaveBeenCalledWith('Invalid username or password'))
  })
})
