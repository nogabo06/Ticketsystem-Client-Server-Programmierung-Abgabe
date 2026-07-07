import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Descriptions, Tag, Button, Card, List, Input, Space, Timeline, Popconfirm, Spin, message } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import {
  getTicket, deleteTicket,
  getComments, addComment, deleteComment,
  getAssignmentHistory,
} from '../api.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getTicket(id),
      getComments(id),
      getAssignmentHistory(id).catch(() => []),
    ]).then(([t, c, h]) => {
      if (!cancelled) { setTicket(t); setComments(c); setHistory(h) }
    }).catch(e => {
      if (!cancelled) message.error(e.message)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      message.warning('Write a comment')
      return
    }
    try {
      // The author is always the logged-in user (set server-side).
      await addComment(id, { commentText })
      setCommentText('')
      const c = await getComments(id)
      setComments(c)
      message.success('Comment added')
    } catch (e) {
      message.error(e.message)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId)
      setComments(comments.filter(c => c.commentId !== commentId))
      message.success('Comment deleted')
    } catch (e) {
      message.error(e.message)
    }
  }

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket(id)
      message.success('Ticket deleted')
      navigate('/tickets')
    } catch (e) {
      message.error(e.message)
    }
  }

  if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />
  if (!ticket) return <p>Ticket not found.</p>

  // Users may edit/delete only their own tickets; admins any.
  const canModify = isAdmin || ticket.creator?.userId === user?.userId

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')}>Back</Button>
          <h2 style={{ margin: 0 }}>{ticket.ticketNo}: {ticket.title}</h2>
        </Space>
        {canModify && (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/tickets/${id}/edit`)}>Edit</Button>
            <Popconfirm title="Delete this ticket?" onConfirm={handleDeleteTicket}>
              <Button danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </Space>
        )}
      </div>

      <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Ticket #">{ticket.ticketNo}</Descriptions.Item>
        <Descriptions.Item label="Title">{ticket.title}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag>{ticket.status?.statusName || '—'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Priority">
          {ticket.priority?.priorityName || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {ticket.category?.categoryName || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Creator">
          {ticket.creator?.fullName || ticket.creator?.username || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Assignee">
          {ticket.assignee?.fullName || ticket.assignee?.username || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Updated">
          {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {ticket.description || '—'}
        </Descriptions.Item>
      </Descriptions>

      <Card title="Comments" size="small" style={{ marginBottom: 24 }}>
        <List
          dataSource={comments}
          locale={{ emptyText: 'No comments yet' }}
          renderItem={(c) => (
            <List.Item
              actions={[
                <Popconfirm key="del" title="Delete comment?" onConfirm={() => handleDeleteComment(c.commentId)}>
                  <Button size="small" danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={c.author?.fullName || c.author?.username || '—'}
                description={c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
              />
              {c.commentText}
            </List.Item>
          )}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Input.TextArea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{ flex: 1 }}
          />
          <Button type="primary" onClick={handleAddComment}>Add</Button>
        </div>
      </Card>

      {history.length > 0 && (
        <Card title="Assignment History" size="small">
          <Timeline
            items={history.map((h) => ({
              children: (
                <span>
                  Assigned to <strong>{h.newAssignee?.fullName || h.newAssignee?.username || '—'}</strong>
                  {h.oldAssignee && <> (was: {h.oldAssignee.fullName || h.oldAssignee.username})</>}
                  {h.changedByUser && <> by {h.changedByUser.fullName || h.changedByUser.username}</>}
                  {h.changedAt && <> — {new Date(h.changedAt).toLocaleString()}</>}
                  {h.changeNote && <> — {h.changeNote}</>}
                </span>
              ),
            }))}
          />
        </Card>
      )}
    </>
  )
}
