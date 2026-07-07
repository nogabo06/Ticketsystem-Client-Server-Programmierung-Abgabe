import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      await login(values)
      // No navigation needed: once `user` is set, App renders the app routes.
    } catch (e) {
      message.error(e.message)
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
          Ticketsystem
        </Typography.Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text type="secondary">No account? </Typography.Text>
          <Link to="/register">Register</Link>
        </div>
      </Card>
    </div>
  )
}
