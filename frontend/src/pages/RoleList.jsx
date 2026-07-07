import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getRoles, createRole, updateRole, deleteRole } from '../api.js'

export default function RoleList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form] = Form.useForm()

  const reload = useCallback(() => { setLoading(true); setRefreshKey(k => k + 1) }, [])

  useEffect(() => {
    let cancelled = false
    getRoles()
      .then(data => { if (!cancelled) setItems(data) })
      .catch(e => { if (!cancelled) message.error(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  const openCreate = () => { setEditing(null); form.resetFields(); setModal(true) }
  const openEdit = (record) => { setEditing(record); form.setFieldsValue({ roleName: record.roleName }); setModal(true) }

  const handleSubmit = async (values) => {
    try {
      if (editing) { await updateRole(editing.roleId, values); message.success('Updated') }
      else { await createRole(values); message.success('Created') }
      setModal(false); reload()
    } catch (e) { message.error(e.message) }
  }

  const handleDelete = async (id) => {
    try { await deleteRole(id); message.success('Deleted'); reload() }
    catch (e) { message.error(e.message) }
  }

  const columns = [
    { title: 'ID', dataIndex: 'roleId', width: 60 },
    { title: 'Name', dataIndex: 'roleName' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.roleId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Roles</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Role</Button>
      </div>
      <Table rowKey="roleId" columns={columns} dataSource={items} loading={loading} pagination={false} />
      <Modal
        title={editing ? 'Edit Role' : 'New Role'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="roleName" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
