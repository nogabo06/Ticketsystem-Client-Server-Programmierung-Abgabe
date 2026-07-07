import { vi } from 'vitest'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../api.js', () => ({
  getPriorities: vi.fn(),
  createPriority: vi.fn(),
  updatePriority: vi.fn(),
  deletePriority: vi.fn(),
}))

import * as api from '../api.js'
import PriorityList from './PriorityList.jsx'
import { runCrudListTests } from '../test/crudListTests.jsx'

runCrudListTests({
  Component: PriorityList,
  rowText: 'High',
  newButton: /new priority/i,
  idValue: 1,
  api: {
    list: api.getPriorities,
    create: api.createPriority,
    update: api.updatePriority,
    del: api.deletePriority,
  },
  seed: () => [{ priorityId: 1, priorityName: 'High', sortOrder: 1 }],
  fillCreateForm: async (dialog) => {
    await userEvent.type(within(dialog).getByRole('textbox'), 'Critical')
  },
  expectedCreate: { priorityName: 'Critical' },
})
