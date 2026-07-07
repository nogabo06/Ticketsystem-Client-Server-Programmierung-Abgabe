import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Select, Button, Spin, message } from 'antd'
import { getTicket, createTicket, updateTicket, getStatuses, getPriorities, getCategories, getUsers, getNextTicketNo } from '../api.js'
import { useAuth } from '../auth/AuthContext.jsx'

const TICKET_NO_PATTERN = /^TKT-\d{4,}$/

export default function TicketForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(!!id)
  const [submitting, setSubmitting] = useState(false)
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let cancelled = false
    // Only admins may list users (and pick creator/assignee); users skip that call.
    Promise.all([getStatuses(), getPriorities(), getCategories(), isAdmin ? getUsers() : Promise.resolve([])])
      .then(async ([sts, pri, cat, usr]) => {
        if (cancelled) return
        setStatuses(sts)
        setPriorities(pri)
        setCategories(cat)
        setUsers(usr)

        if (id) {
          try {
            const ticket = await getTicket(id)
            form.setFieldsValue({
              ticketNo: ticket.ticketNo,
              title: ticket.title,
              description: ticket.description,
              creatorUserId: ticket.creator?.userId,
              assigneeUserId: ticket.assignee?.userId,
              statusId: ticket.status?.statusId,
              priorityId: ticket.priority?.priorityId,
              categoryId: ticket.category?.categoryId,
            })
          } catch (e) {
            message.error(e.message)
          }
          if (!cancelled) setLoading(false)
        } else {
          try {
            const { ticketNo } = await getNextTicketNo()
            if (!cancelled) form.setFieldsValue({ ticketNo })
          } catch {
            // suggestion is a convenience only; the user can still type a ticket number
          }
        }
      })
    return () => { cancelled = true }
  }, [id, form, isAdmin])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (id) {
        await updateTicket(id, values)
        message.success('Ticket updated')
        navigate(`/tickets/${id}`)
      } else {
        const created = await createTicket(values)
        message.success('Ticket created')
        navigate(`/tickets/${created.ticketId}`)
      }
    } catch (e) {
      message.error(e.message)
    }
    setSubmitting(false)
  }

  if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />

  return (
    <>
      <h2 style={{ marginTop: 0 }}>{id ? 'Edit Ticket' : 'New Ticket'}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="ticketNo"
          label="Ticket #"
          // Only admins may edit the number; for others it's system-assigned.
          rules={isAdmin ? [
            { required: true, message: 'Ticket number is required' },
            { pattern: TICKET_NO_PATTERN, message: 'Must match the format TKT-#### (e.g. TKT-0001)' },
          ] : []}
          extra={isAdmin ? undefined : 'Automatically assigned — cannot be changed'}
        >
          <Input disabled={!isAdmin} placeholder="TKT-0001" />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        {isAdmin && (
          <>
            <Form.Item name="creatorUserId" label="Creator" rules={[{ required: true }]}>
              <Select
                placeholder="Select creator"
                options={users.map(u => ({ value: u.userId, label: u.fullName || u.username }))}
              />
            </Form.Item>
            <Form.Item name="assigneeUserId" label="Assignee">
              <Select
                allowClear
                placeholder="Select assignee"
                options={users.map(u => ({ value: u.userId, label: u.fullName || u.username }))}
              />
            </Form.Item>
          </>
        )}
        <Form.Item name="statusId" label="Status" rules={[{ required: true }]}>
          <Select
            placeholder="Select status"
            options={statuses.map(s => ({ value: s.statusId, label: s.statusName }))}
          />
        </Form.Item>
        <Form.Item name="priorityId" label="Priority" rules={[{ required: true }]}>
          <Select
            placeholder="Select priority"
            options={priorities.map(p => ({ value: p.priorityId, label: p.priorityName }))}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
          <Select
            placeholder="Select category"
            options={categories.map(c => ({ value: c.categoryId, label: c.categoryName }))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {id ? 'Update' : 'Create'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
