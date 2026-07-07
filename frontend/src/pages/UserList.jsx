import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../api.js'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form] = Form.useForm()

  const reload = useCallback(() => { setLoading(true); setRefreshKey(k => k + 1) }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getUsers(), getRoles()])
      .then(([u, r]) => { if (!cancelled) { setUsers(u); setRoles(r) } })
      .catch(e => { if (!cancelled) message.error(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  const openCreate = () => { setEditing(null); form.resetFields(); setModal(true) }
  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      username: record.username,
      fullName: record.fullName,
      email: record.email,
      roleId: record.role?.roleId,
    })
    setModal(true)
  }

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateUser(editing.userId, values)
        message.success('User updated')
      } else {
        await createUser(values)
        message.success('User created')
      }
      setModal(false)
      reload()
    } catch (e) {
      message.error(e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      message.success('User deleted')
      reload()
    } catch (e) {
      message.error(e.message)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'userId', width: 60 },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Full Name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: ['role', 'roleName'] },
    { title: 'Active', dataIndex: 'isActive', render: (v) => v ? 'Yes' : 'No', width: 80 },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.userId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New User</Button>
      </div>
      <Table rowKey="userId" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 20 }} />
      <Modal
        title={editing ? 'Edit User' : 'New User'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={editing ? [] : [{ required: true }]}
            extra={editing ? 'Leave blank to keep the current password' : undefined}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select
              placeholder="Select role"
              options={roles.map(r => ({ value: r.roleId, label: r.roleName }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
