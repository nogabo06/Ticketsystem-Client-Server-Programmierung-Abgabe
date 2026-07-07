import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getStatuses, createStatus, updateStatus, deleteStatus } from '../api.js'

export default function StatusList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form] = Form.useForm()

  const reload = useCallback(() => { setLoading(true); setRefreshKey(k => k + 1) }, [])

  useEffect(() => {
    let cancelled = false
    getStatuses()
      .then(data => { if (!cancelled) setItems(data) })
      .catch(e => { if (!cancelled) message.error(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  const openCreate = () => { setEditing(null); form.resetFields(); setModal(true) }
  const openEdit = (record) => { setEditing(record); form.setFieldsValue(record); setModal(true) }

  const handleSubmit = async (values) => {
    try {
      if (editing) { await updateStatus(editing.statusId, values); message.success('Updated') }
      else { await createStatus(values); message.success('Created') }
      setModal(false); reload()
    } catch (e) { message.error(e.message) }
  }

  const handleDelete = async (id) => {
    try { await deleteStatus(id); message.success('Deleted'); reload() }
    catch (e) { message.error(e.message) }
  }

  const columns = [
    { title: 'ID', dataIndex: 'statusId', width: 60 },
    { title: 'Name', dataIndex: 'statusName' },
    { title: 'Sort Order', dataIndex: 'sortOrder', width: 100 },
    { title: 'Final', dataIndex: 'isFinal', render: (v) => v ? 'Yes' : 'No', width: 80 },
    { title: 'System', dataIndex: 'isSystem', render: (v) => v ? 'Yes' : 'No', width: 80 },
    { title: 'Active', dataIndex: 'isActive', render: (v) => v ? 'Yes' : 'No', width: 80 },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.statusId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Statuses</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Status</Button>
      </div>
      <Table rowKey="statusId" columns={columns} dataSource={items} loading={loading} pagination={false} />
      <Modal
        title={editing ? 'Edit Status' : 'New Status'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ sortOrder: 0, isFinal: false, isSystem: false, isActive: true }}>
          <Form.Item name="statusName" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort Order">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isFinal" label="Final" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isSystem" label="System" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
