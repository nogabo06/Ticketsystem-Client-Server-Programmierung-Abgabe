import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

const authState = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => ({ register: authState.register }) }))

vi.mock('../api.js', () => ({ getAuthRoles: vi.fn() }))

import * as api from '../api.js'
import Register from './Register.jsx'

beforeEach(() => {
  vi.clearAllMocks()
  authState.register.mockResolvedValue({ userId: 1 })
  api.getAuthRoles.mockResolvedValue([
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'Member' },
  ])
})

async function fillBaseFields() {
  await userEvent.type(screen.getByLabelText('Full Name'), 'New Person')
  await userEvent.type(screen.getByLabelText('Username'), 'newbie')
  await userEvent.type(screen.getByLabelText('Email'), 'newbie@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret123')
}

describe('Register', () => {
  it('defaults to the non-admin role and submits it', async () => {
    renderWithRouter(<Register />)
    // wait for roles to load and default (Member) to be preselected
    await waitFor(() => expect(api.getAuthRoles).toHaveBeenCalled())
    await fillBaseFields()
    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => expect(authState.register).toHaveBeenCalledTimes(1))
    expect(authState.register).toHaveBeenCalledWith({
      fullName: 'New Person',
      username: 'newbie',
      email: 'newbie@example.com',
      password: 'secret123',
      roleId: 2,
    })
  })

  it('lets the user choose the Admin role', async () => {
    renderWithRouter(<Register />)
    await waitFor(() => expect(api.getAuthRoles).toHaveBeenCalled())
    await fillBaseFields()

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Admin', { selector: '.ant-select-item-option-content' }))

    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => expect(authState.register).toHaveBeenCalledTimes(1))
    expect(authState.register.mock.calls[0][0]).toMatchObject({ roleId: 1 })
  })

  it('shows an error toast when registration fails', async () => {
    authState.register.mockRejectedValue(new Error('Username is already taken'))
    const error = vi.spyOn(message, 'error').mockImplementation(() => {})
    renderWithRouter(<Register />)
    await waitFor(() => expect(api.getAuthRoles).toHaveBeenCalled())
    await fillBaseFields()
    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => expect(error).toHaveBeenCalledWith('Username is already taken'))
  })
})
