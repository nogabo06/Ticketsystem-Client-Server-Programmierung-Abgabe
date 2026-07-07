import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, Button, Select, Space, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined, ClearOutlined } from '@ant-design/icons'
import { getTickets, deleteTicket, getStatuses, getPriorities, getCategories, getUsers } from '../api.js'

export default function TicketList() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => { setLoading(true); setRefreshKey(k => k + 1) }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getStatuses(), getPriorities(), getCategories(), getUsers()])
      .then(([s, p, c, u]) => {
        if (!cancelled) { setStatuses(s); setPriorities(p); setCategories(c); setUsers(u) }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => (Array.isArray(v) ? v.length : v))
    )
    getTickets(Object.keys(clean).length ? clean : undefined)
      .then(data => { if (!cancelled) setTickets(data) })
      .catch(e => { if (!cancelled) message.error(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filters, refreshKey])

  const hasActiveFilters = Object.values(filters).some(v => (Array.isArray(v) ? v.length : v))
  const clearFilters = () => setFilters({})

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id)
      message.success('Ticket deleted')
      reload()
    } catch (e) {
      message.error(e.message)
    }
  }

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNo',
      sorter: (a, b) => a.ticketNo.localeCompare(b.ticketNo),
      render: (text, record) => <Link to={`/tickets/${record.ticketId}`}>{text}</Link>,
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true, sorter: (a, b) => a.title.localeCompare(b.title) },
    {
      title: 'Status',
      dataIndex: ['status', 'statusName'],
      sorter: (a, b) => (a.status?.statusName || '').localeCompare(b.status?.statusName || ''),
      render: (text) => text ? <Tag>{text}</Tag> : '—',
    },
    {
      title: 'Priority',
      dataIndex: ['priority', 'priorityName'],
      sorter: (a, b) => (a.priority?.priorityName || '').localeCompare(b.priority?.priorityName || ''),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'categoryName'],
      sorter: (a, b) => (a.category?.categoryName || '').localeCompare(b.category?.categoryName || ''),
    },
    {
      title: 'Assignee',
      dataIndex: ['assignee', 'fullName'],
      sorter: (a, b) => (a.assignee?.fullName || a.assignee?.username || '').localeCompare(b.assignee?.fullName || b.assignee?.username || ''),
      render: (text, record) => text || record.assignee?.username || '—',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (d) => d ? new Date(d).toLocaleDateString() : '—',
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      defaultSortOrder: 'descend',
      render: (d) => d ? new Date(d).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/tickets/${record.ticketId}`)} />
          <Popconfirm title="Delete this ticket?" onConfirm={() => handleDelete(record.ticketId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Tickets</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/new')}>
          New Ticket
        </Button>
      </div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear mode="multiple" placeholder="Status" style={{ minWidth: 150 }}
          value={filters.status || []}
          options={statuses.map(s => ({ value: s.statusName, label: s.statusName }))}
          onChange={(v) => setFilters(f => ({ ...f, status: v }))}
        />
        <Select
          allowClear mode="multiple" placeholder="Priority" style={{ minWidth: 150 }}
          value={filters.priority || []}
          options={priorities.map(p => ({ value: p.priorityName, label: p.priorityName }))}
          onChange={(v) => setFilters(f => ({ ...f, priority: v }))}
        />
        <Select
          allowClear mode="multiple" placeholder="Category" style={{ minWidth: 150 }}
          value={filters.category || []}
          options={categories.map(c => ({ value: c.categoryName, label: c.categoryName }))}
          onChange={(v) => setFilters(f => ({ ...f, category: v }))}
        />
        <Select
          allowClear mode="multiple" placeholder="Assignee" style={{ minWidth: 180 }}
          value={filters.assignee || []}
          options={users.map(u => ({ value: String(u.userId), label: u.fullName || u.username }))}
          onChange={(v) => setFilters(f => ({ ...f, assignee: v }))}
        />
        <Button icon={<ClearOutlined />} onClick={clearFilters} disabled={!hasActiveFilters}>
          Clear filters
        </Button>
      </Space>
      <Table
        rowKey="ticketId"
        columns={columns}
        dataSource={tickets}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </>
  )
}
