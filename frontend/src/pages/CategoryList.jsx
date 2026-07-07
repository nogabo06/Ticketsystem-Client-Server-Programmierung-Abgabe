import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Switch, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api.js'

export default function CategoryList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form] = Form.useForm()

  const reload = useCallback(() => { setLoading(true); setRefreshKey(k => k + 1) }, [])

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then(data => { if (!cancelled) setItems(data) })
      .catch(e => { if (!cancelled) message.error(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [refreshKey])

  const openCreate = () => { setEditing(null); form.resetFields(); setModal(true) }
  const openEdit = (record) => { setEditing(record); form.setFieldsValue(record); setModal(true) }

  const handleSubmit = async (values) => {
    try {
      if (editing) { await updateCategory(editing.categoryId, values); message.success('Updated') }
      else { await createCategory(values); message.success('Created') }
      setModal(false); reload()
    } catch (e) { message.error(e.message) }
  }

  const handleDelete = async (id) => {
    try { await deleteCategory(id); message.success('Deleted'); reload() }
    catch (e) { message.error(e.message) }
  }

  const columns = [
    { title: 'ID', dataIndex: 'categoryId', width: 60 },
    { title: 'Name', dataIndex: 'categoryName' },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    { title: 'Active', dataIndex: 'isActive', render: (v) => v ? 'Yes' : 'No', width: 80 },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.categoryId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Categories</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Category</Button>
      </div>
      <Table rowKey="categoryId" columns={columns} dataSource={items} loading={loading} pagination={false} />
      <Modal
        title={editing ? 'Edit Category' : 'New Category'}
        open={modal}
        onCancel={() => setModal(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
          <Form.Item name="categoryName" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
