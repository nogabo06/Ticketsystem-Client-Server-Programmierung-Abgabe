import { vi } from 'vitest'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('../api.js', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

import * as api from '../api.js'
import CategoryList from './CategoryList.jsx'
import { runCrudListTests } from '../test/crudListTests.jsx'

runCrudListTests({
  Component: CategoryList,
  rowText: 'Bug',
  newButton: /new category/i,
  idValue: 1,
  api: {
    list: api.getCategories,
    create: api.createCategory,
    update: api.updateCategory,
    del: api.deleteCategory,
  },
  seed: () => [{ categoryId: 1, categoryName: 'Bug', description: 'defects', isActive: true }],
  fillCreateForm: async (dialog) => {
    // Name is the first textbox; the second is the Description textarea.
    await userEvent.type(within(dialog).getAllByRole('textbox')[0], 'Network')
  },
  expectedCreate: { categoryName: 'Network' },
})
