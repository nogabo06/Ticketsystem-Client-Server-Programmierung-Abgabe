import { vi } from 'vitest'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../api.js', () => ({
  getRoles: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
}))

import * as api from '../api.js'
import RoleList from './RoleList.jsx'
import { runCrudListTests } from '../test/crudListTests.jsx'

runCrudListTests({
  Component: RoleList,
  rowText: 'Admin',
  newButton: /new role/i,
  idValue: 1,
  api: {
    list: api.getRoles,
    create: api.createRole,
    update: api.updateRole,
    del: api.deleteRole,
  },
  seed: () => [{ roleId: 1, roleName: 'Admin' }],
  fillCreateForm: async (dialog) => {
    await userEvent.type(within(dialog).getByRole('textbox'), 'Manager')
  },
  expectedCreate: { roleName: 'Manager' },
})
