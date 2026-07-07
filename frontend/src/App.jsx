import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Spin, Button, Space, Typography } from 'antd'
import {
  TagsOutlined,
  UserOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import TicketList from './pages/TicketList.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import TicketForm from './pages/TicketForm.jsx'
import UserList from './pages/UserList.jsx'
import StatusList from './pages/StatusList.jsx'
import CategoryList from './pages/CategoryList.jsx'
import PriorityList from './pages/PriorityList.jsx'
import RoleList from './pages/RoleList.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { useAuth } from './auth/AuthContext.jsx'

const { Sider, Content, Header } = Layout

// Menu entries every logged-in user sees.
const baseMenuItems = [
  { key: '/tickets', icon: <TagsOutlined />, label: <Link to="/tickets">Tickets</Link> },
]

// Master-data entries only admins may see/manage.
const adminMenuItems = [
  { key: '/users', icon: <UserOutlined />, label: <Link to="/users">Users</Link> },
  { key: '/statuses', icon: <CheckCircleOutlined />, label: <Link to="/statuses">Statuses</Link> },
  { key: '/categories', icon: <AppstoreOutlined />, label: <Link to="/categories">Categories</Link> },
  { key: '/priorities', icon: <ThunderboltOutlined />, label: <Link to="/priorities">Priorities</Link> },
  { key: '/roles', icon: <SafetyOutlined />, label: <Link to="/roles">Roles</Link> },
]

export default function App() {
  const location = useLocation()
  const { user, loading, isAdmin, logout } = useAuth()
  const selectedKey = '/' + location.pathname.split('/')[1]

  if (loading) {
    return <Spin style={{ display: 'block', marginTop: '20vh' }} />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  const menuItems = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  // Admin-only routes redirect non-admins back to their ticket list.
  const adminRoute = (element) => (isAdmin ? element : <Navigate to="/tickets" replace />)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth={48}>
        <div style={{ padding: '16px', fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
          Tickets
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingInline: 24 }}>
          <Space>
            <Typography.Text type="secondary">
              {user.fullName || user.username}{user.role?.roleName ? ` (${user.role.roleName})` : ''}
            </Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>Logout</Button>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/new" element={<TicketForm />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/tickets/:id/edit" element={<TicketForm />} />
            <Route path="/users" element={adminRoute(<UserList />)} />
            <Route path="/statuses" element={adminRoute(<StatusList />)} />
            <Route path="/categories" element={adminRoute(<CategoryList />)} />
            <Route path="/priorities" element={adminRoute(<PriorityList />)} />
            <Route path="/roles" element={adminRoute(<RoleList />)} />
            <Route path="*" element={<Navigate to="/tickets" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
