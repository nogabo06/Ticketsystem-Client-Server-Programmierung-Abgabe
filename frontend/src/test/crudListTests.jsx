import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { message } from 'antd'
import { renderWithRouter } from './utils.jsx'

/**
 * Shared button test suite for the simple CRUD "list" pages (Status, Category,
 * Priority, Role, User). They all share the same shape: a "New X" button that
 * opens a modal form, per-row Edit (pencil) and Delete (trash) buttons, and
 * antd message toasts on success/failure.
 *
 * @param {object}   cfg
 * @param {Function} cfg.Component       the page component under test
 * @param {string}   cfg.rowText         text identifying the seeded row
 * @param {RegExp}   cfg.newButton       accessible name of the "New" button
 * @param {number}   cfg.idValue         id of the seeded record
 * @param {object}   cfg.api             mocked api fns { list, create, update, del }
 * @param {Function} cfg.seed            () => array of records returned by list
 * @param {Function} cfg.fillCreateForm  (dialog) => Promise, fills the new-record form
 * @param {object}   cfg.expectedCreate  objectContaining matcher for create payload
 */
export function runCrudListTests(cfg) {
  const { Component, rowText, newButton, idValue, api, seed, fillCreateForm, expectedCreate } = cfg

  describe(`${Component.name} buttons`, () => {
    beforeEach(() => {
      vi.clearAllMocks()
      api.list.mockResolvedValue(seed())
      api.create.mockResolvedValue({})
      api.update.mockResolvedValue({})
      api.del.mockResolvedValue(null)
      if (cfg.extraBeforeEach) cfg.extraBeforeEach()
    })

    it('renders seeded rows', async () => {
      renderWithRouter(<Component />)
      expect(await screen.findByText(rowText)).toBeInTheDocument()
    })

    it('New button opens the create modal and submits', async () => {
      const success = vi.spyOn(message, 'success').mockImplementation(() => {})
      renderWithRouter(<Component />)
      await screen.findByText(rowText)

      await userEvent.click(screen.getByRole('button', { name: newButton }))
      const dialog = await screen.findByRole('dialog')
      await fillCreateForm(dialog)

      await userEvent.click(within(dialog).getByRole('button', { name: /^ok$/i }))

      await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1))
      if (expectedCreate) {
        expect(api.create).toHaveBeenCalledWith(expect.objectContaining(expectedCreate))
      }
      expect(success).toHaveBeenCalledWith('Created')
    })

    it('Edit button opens the modal and submits an update', async () => {
      const success = vi.spyOn(message, 'success').mockImplementation(() => {})
      renderWithRouter(<Component />)
      await screen.findByText(rowText)

      const row = screen.getByText(rowText).closest('tr')
      const editBtn = within(row).getAllByRole('button')[0]
      await userEvent.click(editBtn)

      const dialog = await screen.findByRole('dialog')
      await userEvent.click(within(dialog).getByRole('button', { name: /^ok$/i }))

      await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1))
      expect(api.update.mock.calls[0][0]).toBe(idValue)
      expect(success).toHaveBeenCalledWith('Updated')
    })

    it('Delete button confirms and calls delete', async () => {
      const success = vi.spyOn(message, 'success').mockImplementation(() => {})
      renderWithRouter(<Component />)
      await screen.findByText(rowText)

      const row = screen.getByText(rowText).closest('tr')
      const deleteBtn = within(row).getAllByRole('button')[1]
      await userEvent.click(deleteBtn)

      await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

      await waitFor(() => expect(api.del).toHaveBeenCalledWith(idValue))
      expect(success).toHaveBeenCalledWith('Deleted')
    })

    it('shows an error toast when delete fails', async () => {
      api.del.mockRejectedValue(new Error('record in use'))
      const error = vi.spyOn(message, 'error').mockImplementation(() => {})
      renderWithRouter(<Component />)
      await screen.findByText(rowText)

      const row = screen.getByText(rowText).closest('tr')
      const deleteBtn = within(row).getAllByRole('button')[1]
      await userEvent.click(deleteBtn)
      await userEvent.click(await screen.findByRole('button', { name: /^ok$/i }))

      await waitFor(() => expect(error).toHaveBeenCalledWith('record in use'))
    })
  })
}
