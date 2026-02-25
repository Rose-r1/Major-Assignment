import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import HotelInfo from './pages/HotelInfo'
import HotelReview from './pages/HotelReview'
import RoleRoute from './components/RoleRoute';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}




const App = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState(
    localStorage.getItem('role') || 'admin'
  );
  const items = [];

  if (role === 'merchant') {
    items.push(
      getItem('酒店信息管理', '/hotel-info', <PieChartOutlined />)
    );
  }

  if (role === 'admin') {
    items.push(
      getItem('酒店审核管理', '/hotel-review', <DesktopOutlined />)
    );
  }

  items.push(getItem('退出登录', 'logout', <UserOutlined />));
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.reload();
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={items} onClick={handleMenuClick}/>
      </Sider>
      <Layout>
        {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
        <Content style={{ margin: '0' }}>
          <Routes>
            <Route path="/" element={<Navigate to={items[0]?.key || '/'} />} />

            <Route
              path="/hotel-info"
              element={
                <RoleRoute allowRoles={['merchant']}>
                  <HotelInfo />
                </RoleRoute>
              }
            />

            <Route
              path="/hotel-review"
              element={
                <RoleRoute allowRoles={['admin']}>
                  <HotelReview />
                </RoleRoute>
              }
            />
          </Routes>
        </Content>

        {/* <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer> */}
      </Layout>
    </Layout>
  );
};
export default App;