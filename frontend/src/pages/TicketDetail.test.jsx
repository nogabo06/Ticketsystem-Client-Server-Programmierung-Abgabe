import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from '../test/utils.jsx'

const navigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate, useParams: () => ({ id: '1' }) }
})

vi.mock('../api.js', () => ({
  getTicket: vi.fn(),
  deleteTicket: vi.fn(),
  getComments: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
  getAssignmentHistory: vi.fn(),
}))

// Mutable auth state so tests can switch between admin and (owning/non-owning) user.
const authState = vi.hoisted(() => ({ current: {} }))
vi.mock('../auth/AuthContext.jsx', () => ({ useAuth: () => authState.current }))

import * as api from '../api.js'
import TicketDetail from './TicketDetail.jsx'

const ticket = {
  ticketId: 1,
  ticketNo: 'TKT-0001',
  title: 'Broken login',
  description: 'Cannot log in',
  status: { statusName: 'Open' },
  priority: { priorityName: 'High' },
  category: { categoryName: 'Bug' },
  creator: { fullName: 'Carol' },
  assignee: { fullName: 'Alice' },
  createdAt: '2026-01-01T10:00:00',
}

const comments = [
  { commentId: 10, author: { fullName: 'Alice' }, commentText: 'Looking into it', createdAt: '2026-01-02T09:00:00' },
]

beforeEach(() => {
  vi.clearAllMocks()
  authState.current = { isAdmin: true, user: { userId: 1, role: { roleName: 'Admin' } } }
  api.getTicket.mockResolvedValue(ticket)
  api.getComments.mockResolvedValue(comments)
  api.getAssignmentHistory.mockResolvedValue([])
  api.deleteTicket.mockResolvedValue(null)
  api.addComment.mockResolvedValue({})
  api.deleteComment.mockResolvedValue(null)
})

describe('TicketDetail buttons', () => {
  it('renders ticket details', async () => {
    renderWithRouter(<TicketDetail />)
    expect(await screen.findByText('TKT-0001: Broken login')).toBeInTheDocument()
  })

  it('Back button navigates to the ticket list', async () => {
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(navigate).toHaveBeenCalledWith('/tickets')
  })

  it('Edit button navigates to the edit form', async () => {
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(navigate).toHaveBeenCalledWith('/tickets/1/edit')
  })

  it('Delete button removes the ticket and navigates back', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')

    // Both the ticket header and each comment have a delete button; pick the
    // header one, which is the only delete button with visible "Delete" text.
    const ticketDelete = screen
      .getAllByRole('button', { name: /delete/i })
      .find((b) => b.textContent.includes('Delete'))
    await userEvent.click(ticketDelete)
    await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(api.deleteTicket).toHaveBeenCalledWith('1'))
    expect(success).toHaveBeenCalledWith('Ticket deleted')
    expect(navigate).toHaveBeenCalledWith('/tickets')
  })

  it('Add button posts a new comment', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    api.getComments
      .mockResolvedValueOnce(comments) // initial load
      .mockResolvedValueOnce([...comments, { commentId: 11, author: { fullName: 'Alice' }, commentText: 'New note' }])
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')

    // The author is set server-side from the session, so only text is entered.
    await userEvent.type(screen.getByPlaceholderText(/write a comment/i), 'New note')
    await userEvent.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => expect(api.addComment).toHaveBeenCalledTimes(1))
    expect(api.addComment).toHaveBeenCalledWith('1', expect.objectContaining({ commentText: 'New note' }))
    expect(api.addComment.mock.calls[0][1]).not.toHaveProperty('authorUserId')
    expect(success).toHaveBeenCalledWith('Comment added')
  })

  it('warns when adding an empty comment', async () => {
    const warning = vi.spyOn(message, 'warning').mockImplementation(() => {})
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')

    await userEvent.click(screen.getByRole('button', { name: /add/i }))
    await waitFor(() => expect(warning).toHaveBeenCalled())
    expect(api.addComment).not.toHaveBeenCalled()
  })

  it('Delete comment button removes the comment', async () => {
    const success = vi.spyOn(message, 'success').mockImplementation(() => {})
    renderWithRouter(<TicketDetail />)
    await screen.findByText('Looking into it')

    // the comment row delete button lives inside the comments card list item
    const commentItem = screen.getByText('Looking into it').closest('.ant-list-item')
    await userEvent.click(within(commentItem).getByRole('button'))
    await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

    await waitFor(() => expect(api.deleteComment).toHaveBeenCalledWith('1', 10))
    expect(success).toHaveBeenCalledWith('Comment deleted')
  })

  it('hides Edit/Delete for a non-admin who does not own the ticket', async () => {
    // Ticket creator has no matching userId; a non-admin viewer cannot modify it.
    authState.current = { isAdmin: false, user: { userId: 99, role: { roleName: 'User' } } }
    renderWithRouter(<TicketDetail />)
    await screen.findByText('TKT-0001: Broken login')

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    const deleteButtons = screen.queryAllByRole('button', { name: /delete/i })
    // Only the per-comment delete (icon, no visible "Delete" text) may remain.
    expect(deleteButtons.find((b) => b.textContent.includes('Delete'))).toBeUndefined()
  })
})
