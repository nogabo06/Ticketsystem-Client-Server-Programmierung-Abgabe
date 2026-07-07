import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTickets, getNextTicketNo, setToken, getToken } from './api.js'

// These tests exercise the real request()/buildQuery() logic in api.js by
// stubbing globalThis.fetch directly, rather than mocking the module (as the
// page tests do), since buildQuery itself isn't exported.

function mockFetchOnce(body, { status = 200 } = {}) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  })
}

describe('api.js buildQuery (via getTickets)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    mockFetchOnce([])
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('repeats the key for each value in an array param (multi-select filter)', async () => {
    await getTickets({ assignee: [1, 2] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?assignee=1&assignee=2')
  })

  it('repeats the key for each value across multiple array params', async () => {
    await getTickets({ assignee: [1, 2], status: ['Open', 'Closed'] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?assignee=1&assignee=2&status=Open&status=Closed')
  })

  it('supports a single-value array param', async () => {
    await getTickets({ assignee: [1] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?assignee=1')
  })

  it('skips empty arrays entirely', async () => {
    await getTickets({ assignee: [], status: ['Open'] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?status=Open')
  })

  it('skips null, undefined and empty-string scalar values', async () => {
    await getTickets({ creator: null, assignee: undefined, category: '', status: ['Open'] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?status=Open')
  })

  it('produces no query string when params is undefined', async () => {
    await getTickets()
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets')
  })

  it('produces no query string when all params are empty/falsy', async () => {
    await getTickets({ creator: null, status: [] })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets')
  })

  it('still supports plain scalar params alongside array params', async () => {
    await getTickets({ assignee: [1, 2], creator: 5 })
    const url = globalThis.fetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:8080/api/tickets?assignee=1&assignee=2&creator=5')
  })
})

describe('api.js getNextTicketNo', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetches the suggested next ticket number', async () => {
    mockFetchOnce({ ticketNo: 'TKT-0007' })
    const result = await getNextTicketNo()
    expect(globalThis.fetch.mock.calls[0][0]).toBe('http://localhost:8080/api/tickets/next-number')
    expect(result).toEqual({ ticketNo: 'TKT-0007' })
  })
})

describe('api.js authentication', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    setToken(null)
    globalThis.fetch = originalFetch
  })

  it('sends the Authorization header when a token is set', async () => {
    setToken('abc123')
    mockFetchOnce([])
    await getTickets()
    const options = globalThis.fetch.mock.calls[0][1]
    expect(options.headers.Authorization).toBe('Bearer abc123')
  })

  it('omits the Authorization header when no token is set', async () => {
    setToken(null)
    mockFetchOnce([])
    await getTickets()
    const options = globalThis.fetch.mock.calls[0][1]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('clears the stored token on a 401 response', async () => {
    setToken('will-expire')
    mockFetchOnce({ error: 'Invalid or expired session' }, { status: 401 })
    await expect(getTickets()).rejects.toThrow()
    expect(getToken()).toBeNull()
  })
})
