import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Select, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext.jsx'
import { getAuthRoles } from '../api.js'

export default function Register() {
  const { register } = useAuth()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    let cancelled = false
    getAuthRoles()
      .then((rs) => {
        if (cancelled) return
        setRoles(rs)
        // Default to a non-admin role if present, else the first one.
        const preset = rs.find((r) => r.roleName !== 'Admin') || rs[0]
        if (preset) form.setFieldsValue({ roleId: preset.roleId })
      })
      .catch(() => { /* roles are a convenience; registration still works without a pick */ })
    return () => { cancelled = true }
  }, [form])

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      await register(values)
      // On success the user is auto-logged-in; App re-renders into the app.
      message.success('Account created')
    } catch (e) {
      message.error(e.message)
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
          Create account
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<IdcardOutlined />} autoComplete="name" />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select
              prefix={<SafetyOutlined />}
              placeholder="Select role"
              options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              Register
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text type="secondary">Already have an account? </Typography.Text>
          <Link to="/login">Log in</Link>
        </div>
      </Card>
    </div>
  )
}
