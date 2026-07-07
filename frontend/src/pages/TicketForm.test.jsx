import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

const navigate = vi.fn()
const routeParams = vi.hoisted(() => ({ current: {} }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate, useParams: () => routeParams.current }
})

vi.mock('../api.js', () => ({
  getTicket: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  getStatuses: vi.fn(),
  getPriorities: vi.fn(),
  getCategories: vi.fn(),
  getUsers: vi.fn(),
  getNextTicketNo: vi.fn(),
}))

// Mutable auth state so individual tests can switch between admin and user.
const authState = vi.hoisted(() => ({ current: {} }))
vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => authState.current }))

import * as api from '../api.js'
import TicketForm from './TicketForm.jsx'

beforeEach(() => {
  vi.clearAllMocks()
  authState.current = { isAdmin: true, user: { userId: 1, role: { roleName: 'Admin' } } }
  routeParams.current = {}
  api.getStatuses.mockResolvedValue([{ statusId: 1, statusName: 'Open' }])
  api.getPriorities.mockResolvedValue([{ priorityId: 1, priorityName: 'High' }])
  api.getCategories.mockResolvedValue([{ categoryId: 1, categoryName: 'Bug' }])
  api.getUsers.mockResolvedValue([{ userId: 1, fullName: 'Alice', username: 'alice' }])
  api.createTicket.mockResolvedValue({ ticketId: 5 })
  api.updateTicket.mockResolvedValue({ ticketId: 1 })
  api.getNextTicketNo.mockResolvedValue({ ticketNo: 'TKT-0010' })
})

async function selectOption(label, optionText) {
  await userEvent.click(screen.getByLabelText(label))
  await userEvent.click(await screen.findByText(optionText, { selector: '.ant-select-item-option-content' }))
}

describe('TicketForm buttons', () => {
  it('Create button submits a new ticket and navigates to it', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<TicketForm />)

    const ticketNoInput = await screen.findByLabelText('Ticket #')
    // The ticket number is read-only and pre-filled from the suggestion.
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0010'))
    await userEvent.type(screen.getByLabelText('Title'), 'New issue')
    await userEvent.type(screen.getByLabelText('Description'), 'Something is wrong')
    await selectOption('Creator', 'Alice')
    await selectOption('Status', 'Open')
    await selectOption('Priority', 'High')
    await selectOption('Category', 'Bug')

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(api.createTicket).toHaveBeenCalledTimes(1))
    expect(api.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketNo: 'TKT-0010',
        title: 'New issue',
        description: 'Something is wrong',
        creatorUserId: 1,
        statusId: 1,
        priorityId: 1,
        categoryId: 1,
      }),
    )
    expect(success).toHaveBeenCalledWith('Ticket created')
    expect(navigate).toHaveBeenCalledWith('/tickets/5')
  })

  it('Update button submits changes for an existing ticket', async () => {
    routeParams.current = { id: '1' }
    api.getTicket.mockResolvedValue({
      ticketId: 1,
      ticketNo: 'TKT-0001',
      title: 'Broken login',
      description: 'Cannot log in',
      creator: { userId: 1 },
      status: { statusId: 1 },
      priority: { priorityId: 1 },
      category: { categoryId: 1 },
    })
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<TicketForm />, { route: '/tickets/1/edit' })

    const title = await screen.findByLabelText('Title')
    await waitFor(() => expect(title).toHaveValue('Broken login'))
    await userEvent.clear(title)
    await userEvent.type(title, 'Broken login page')

    await userEvent.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(api.updateTicket).toHaveBeenCalledTimes(1))
    expect(api.updateTicket.mock.calls[0][0]).toBe('1')
    expect(api.updateTicket.mock.calls[0][1]).toEqual(
      expect.objectContaining({ title: 'Broken login page' }),
    )
    expect(success).toHaveBeenCalledWith('Ticket updated')
    expect(navigate).toHaveBeenCalledWith('/tickets/1')
  })

  it('Cancel button goes back', async () => {
    renderWithRouter(<TicketForm />)
    await screen.findByLabelText('Ticket #')
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(navigate).toHaveBeenCalledWith(-1)
  })

  it('pre-fills the ticket number from getNextTicketNo on create', async () => {
    renderWithRouter(<TicketForm />)
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0010'))
    expect(api.getNextTicketNo).toHaveBeenCalledTimes(1)
  })

  it('does not fetch a suggestion when editing an existing ticket', async () => {
    routeParams.current = { id: '1' }
    api.getTicket.mockResolvedValue({
      ticketId: 1,
      ticketNo: 'TKT-0001',
      title: 'Broken login',
      description: 'Cannot log in',
      creator: { userId: 1 },
      status: { statusId: 1 },
      priority: { priorityId: 1 },
      category: { categoryId: 1 },
    })
    renderWithRouter(<TicketForm />, { route: '/tickets/1/edit' })
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0001'))
    expect(api.getNextTicketNo).not.toHaveBeenCalled()
  })

  it('the ticket number field is read-only for non-admins', async () => {
    authState.current = { isAdmin: false, user: { userId: 2, role: { roleName: 'Member' } } }
    renderWithRouter(<TicketForm />)
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0010'))
    expect(ticketNoInput).toBeDisabled()
  })

  it('lets an admin edit the ticket number', async () => {
    renderWithRouter(<TicketForm />) // default admin
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0010'))
    expect(ticketNoInput).toBeEnabled()

    await userEvent.clear(ticketNoInput)
    await userEvent.type(ticketNoInput, 'TKT-9999')
    expect(ticketNoInput).toHaveValue('TKT-9999')
  })

  it('blocks submission for a malformed ticket number entered by an admin', async () => {
    renderWithRouter(<TicketForm />) // default admin
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    await waitFor(() => expect(ticketNoInput).toHaveValue('TKT-0010'))

    await userEvent.clear(ticketNoInput)
    await userEvent.type(ticketNoInput, 'not-a-valid-number')
    await userEvent.type(screen.getByLabelText('Title'), 'New issue')
    await userEvent.type(screen.getByLabelText('Description'), 'Something is wrong')
    await selectOption('Creator', 'Alice')
    await selectOption('Status', 'Open')
    await selectOption('Priority', 'High')
    await selectOption('Category', 'Bug')

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(await screen.findByText('Must match the format TKT-#### (e.g. TKT-0001)')).toBeInTheDocument()
    expect(api.createTicket).not.toHaveBeenCalled()
  })

  it('still allows create when fetching the suggestion fails', async () => {
    api.getNextTicketNo.mockRejectedValue(new Error('network error'))
    renderWithRouter(<TicketForm />)
    const ticketNoInput = await screen.findByLabelText('Ticket #')
    expect(ticketNoInput).toHaveValue('')
  })

  it('hides the Creator field and does not list users for non-admins', async () => {
    authState.current = { isAdmin: false, user: { userId: 2, role: { roleName: 'User' } } }
    renderWithRouter(<TicketForm />)

    await screen.findByLabelText('Title')
    expect(screen.queryByLabelText('Creator')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Assignee')).not.toBeInTheDocument()
    expect(api.getUsers).not.toHaveBeenCalled()
  })
})
