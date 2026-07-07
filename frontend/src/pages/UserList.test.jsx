import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../api.js', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getRoles: vi.fn(),
}))

import * as api from '../api.js'
import UserList from './UserList.jsx'

const users = [
  {
    userId: 1,
    username: 'alice',
    fullName: 'Alice Adams',
    email: 'alice@example.com',
    role: { roleId: 1, roleName: 'Admin' },
    isActive: true,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  api.getUsers.mockResolvedValue(users)
  api.getRoles.mockResolvedValue([{ roleId: 1, roleName: 'Admin' }])
  api.createUser.mockResolvedValue({})
  api.updateUser.mockResolvedValue({})
  api.deleteUser.mockResolvedValue(null)
})

async function pickRole(dialog) {
  const combobox = within(dialog).getByRole('combobox')
  await userEvent.click(combobox)
  const option = await screen.findByText('Admin', { selector: '.ant-select-item-option-content' })
  await userEvent.click(option)
}

describe('UserList buttons', () => {
  it('renders seeded users', async () => {
    renderWithRouter(<UserList />)
    expect(await screen.findByText('Alice Adams')).toBeInTheDocument()
  })

  it('New User button creates a user', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<UserList />)
    await screen.findByText('Alice Adams')

    await userEvent.click(screen.getByRole('button', { name: /new user/i }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText('Username'), 'bob')
    await userEvent.type(within(dialog).getByLabelText('Password'), 'secret123')
    await userEvent.type(within(dialog).getByLabelText('Full Name'), 'Bob Brown')
    await userEvent.type(within(dialog).getByLabelText('Email'), 'bob@example.com')
    await pickRole(dialog)

    await userEvent.click(within(dialog).getByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(api.createUser).toHaveBeenCalledTimes(1))
    expect(api.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'bob', fullName: 'Bob Brown', email: 'bob@example.com', roleId: 1 }),
    )
    expect(success).toHaveBeenCalledWith('User created')
  })

  it('Edit button updates an existing user', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<UserList />)
    await screen.findByText('Alice Adams')

    const row = screen.getByText('Alice Adams').closest('tr')
    await userEvent.click(within(row).getAllByRole('button')[0])

    const dialog = await screen.findByRole('dialog')
    const fullName = within(dialog).getByLabelText('Full Name')
    await userEvent.clear(fullName)
    await userEvent.type(fullName, 'Alice Anderson')

    await userEvent.click(within(dialog).getByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(api.updateUser).toHaveBeenCalledTimes(1))
    expect(api.updateUser.mock.calls[0][0]).toBe(1)
    expect(api.updateUser.mock.calls[0][1]).toEqual(
      expect.objectContaining({ fullName: 'Alice Anderson' }),
    )
    expect(success).toHaveBeenCalledWith('User updated')
  })

  it('Delete button removes a user', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<UserList />)
    await screen.findByText('Alice Adams')

    const row = screen.getByText('Alice Adams').closest('tr')
    await userEvent.click(within(row).getAllByRole('button')[1])
    await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(api.deleteUser).toHaveBeenCalledWith(1))
    expect(success).toHaveBeenCalledWith('User deleted')
  })

  it('shows an error toast when delete fails', async () => {
    api.deleteUser.mockRejectedValue(new Error('user has tickets'))
    const error = vi.spyOn(message, 'error').mockImplementation(() => {})
    renderWithRouter(<UserList />)
    await screen.findByText('Alice Adams')

    const row = screen.getByText('Alice Adams').closest('tr')
    await userEvent.click(within(row).getAllByRole('button')[1])
    await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(error).toHaveBeenCalledWith('user has tickets'))
  })
})
