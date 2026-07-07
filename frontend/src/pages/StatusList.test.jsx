import { vi } from 'vitest'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../api.js', () => ({
  getStatuses: vi.fn(),
  createStatus: vi.fn(),
  updateStatus: vi.fn(),
  deleteStatus: vi.fn(),
}))

import * as api from '../api.js'
import StatusList from './StatusList.jsx'
import { runCrudListTests } from '../test/crudListTests.jsx'

runCrudListTests({
  Component: StatusList,
  rowText: 'Open',
  newButton: /new status/i,
  idValue: 1,
  api: {
    list: api.getStatuses,
    create: api.createStatus,
    update: api.updateStatus,
    del: api.deleteStatus,
  },
  seed: () => [
    { statusId: 1, statusName: 'Open', sortOrder: 0, isFinal: false, isSystem: false, isActive: true },
  ],
  fillCreateForm: async (dialog) => {
    await userEvent.type(within(dialog).getByRole('textbox'), 'In Progress')
  },
  expectedCreate: { statusName: 'In Progress' },
})
