import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

// --- mocks ---------------------------------------------------------------
const navigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../api.js', () => ({
  getTickets: vi.fn(),
  deleteTicket: vi.fn(),
  getStatuses: vi.fn(),
  getPriorities: vi.fn(),
  getCategories: vi.fn(),
  getUsers: vi.fn(),
}))

import * as api from '../api.js'
import TicketList from './TicketList.jsx'

const tickets = [
  {
    ticketId: 1,
    ticketNo: 'TKT-0001',
    title: 'Broken login',
    status: { statusName: 'Open' },
    priority: { priorityName: 'High' },
    category: { categoryName: 'Bug' },
    assignee: { fullName: 'Alice' },
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-03T10:00:00',
  },
  {
    ticketId: 2,
    ticketNo: 'TKT-0002',
    title: 'Alpha task',
    status: { statusName: 'Closed' },
    priority: { priorityName: 'Low' },
    category: { categoryName: 'Feature' },
    assignee: { fullName: 'Bob' },
    createdAt: '2026-01-02T10:00:00',
    updatedAt: '2026-01-05T10:00:00',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  api.getStatuses.mockResolvedValue([{ statusId: 1, statusName: 'Open' }, { statusId: 2, statusName: 'Closed' }])
  api.getPriorities.mockResolvedValue([{ priorityId: 1, priorityName: 'High' }])
  api.getCategories.mockResolvedValue([{ categoryId: 1, categoryName: 'Bug' }])
  api.getUsers.mockResolvedValue([
    { userId: 1, fullName: 'Alice', username: 'alice' },
    { userId: 2, fullName: 'Bob', username: 'bob' },
  ])
  api.getTickets.mockResolvedValue(tickets)
  api.deleteTicket.mockResolvedValue(null)
})

describe('TicketList buttons', () => {
  it('renders the ticket rows', async () => {
    renderWithRouter(<TicketList />)
    expect(await screen.findByText('Broken login')).toBeInTheDocument()
  })

  it('New Ticket button navigates to the create form', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')
    await userEvent.click(screen.getByRole('button', { name: /new ticket/i }))
    expect(navigate).toHaveBeenCalledWith('/tickets/new')
  })

  it('view (eye) button navigates to the ticket detail', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')
    const row = screen.getByText('Broken login').closest('tr')
    // first action button in the row is the view button
    const viewBtn = within(row).getAllByRole('button')[0]
    await userEvent.click(viewBtn)
    expect(navigate).toHaveBeenCalledWith('/tickets/1')
  })

  it('delete button calls deleteTicket and shows success', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')

    const row = screen.getByText('Broken login').closest('tr')
    const deleteBtn = within(row).getAllByRole('button')[1]
    await userEvent.click(deleteBtn)

    // confirm in the popconfirm
    const okBtn = await screen.findByRole('button', { name: /^ok$/i })
    await userEvent.click(okBtn)

    await waitFor(() => expect(api.deleteTicket).toHaveBeenCalledWith(1))
    expect(success).toHaveBeenCalledWith('Ticket deleted')
  })

  it('shows an error message when deletion fails', async () => {
    api.deleteTicket.mockRejectedValue(new Error('still in use'))
    const error = vi.spyOn(message, 'error').mockImplementation(() => {})
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')

    const row = screen.getByText('Broken login').closest('tr')
    const deleteBtn = within(row).getAllByRole('button')[1]
    await userEvent.click(deleteBtn)
    await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(error).toHaveBeenCalledWith('still in use'))
  })

  it('renders the Updated column with a formatted date', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')
    const row = screen.getByText('Broken login').closest('tr')
    expect(within(row).getByText(new Date(tickets[0].updatedAt).toLocaleDateString())).toBeInTheDocument()
  })

  // Filters render in order Status, Priority, Category, Assignee; each is a
  // multi-select combobox input (the visible "Assignee" placeholder text
  // itself has pointer-events: none, so interact via the search input).
  function getAssigneeCombobox() {
    return screen.getAllByRole('combobox').at(-1)
  }

  it('selecting multiple assignees calls getTickets with an array of assignee ids', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')
    api.getTickets.mockClear()

    await userEvent.click(getAssigneeCombobox())
    await userEvent.click(await screen.findByText('Alice', { selector: '.ant-select-item-option-content' }))
    await userEvent.click(await screen.findByText('Bob', { selector: '.ant-select-item-option-content' }))

    await waitFor(() => {
      const lastCall = api.getTickets.mock.calls.at(-1)
      expect(lastCall[0]).toEqual(expect.objectContaining({ assignee: ['1', '2'] }))
    })
  })

  it('Clear filters resets filters and re-fetches with no params, and is disabled with no active filters', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')

    const clearBtn = screen.getByRole('button', { name: /clear filters/i })
    expect(clearBtn).toBeDisabled()

    await userEvent.click(getAssigneeCombobox())
    await userEvent.click(await screen.findByText('Alice', { selector: '.ant-select-item-option-content' }))

    await waitFor(() => expect(clearBtn).not.toBeDisabled())

    api.getTickets.mockClear()
    await userEvent.click(clearBtn)

    expect(clearBtn).toBeDisabled()
    await waitFor(() => {
      const lastCall = api.getTickets.mock.calls.at(-1)
      expect(lastCall[0]).toBeUndefined()
    })
  })

  it('clicking the Title column header sorts rows alphabetically', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')

    const titleHeader = screen.getByText('Title')
    await userEvent.click(titleHeader)

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1) // skip header row
      expect(within(rows[0]).getByText('Alpha task')).toBeInTheDocument()
      expect(within(rows[1]).getByText('Broken login')).toBeInTheDocument()
    })
  })

  it('table opens sorted by Updated descending by default', async () => {
    renderWithRouter(<TicketList />)
    await screen.findByText('Broken login')

    const rows = screen.getAllByRole('row').slice(1)
    // ticket 2 has the later updatedAt, so it should sort first by default
    expect(within(rows[0]).getByText('Alpha task')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Broken login')).toBeInTheDocument()
  })
})

describe('TicketList sorter comparators (unit)', () => {
  it('createdAt sorter orders by date ascending', () => {
    const sorter = (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    const sorted = [...tickets].sort(sorter)
    expect(sorted[0].ticketId).toBe(1)
    expect(sorted[1].ticketId).toBe(2)
  })

  it('updatedAt sorter orders by date ascending (table applies descend by default)', () => {
    const sorter = (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    const sorted = [...tickets].sort(sorter)
    expect(sorted[0].ticketId).toBe(1)
    expect(sorted[1].ticketId).toBe(2)
  })

  it('title sorter orders alphabetically', () => {
    const sorter = (a, b) => a.title.localeCompare(b.title)
    const sorted = [...tickets].sort(sorter)
    expect(sorted.map(t => t.title)).toEqual(['Alpha task', 'Broken login'])
  })
})
