import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, type MenuProps } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  RobotOutlined,
  UserOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.ui);

  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/upload',
      icon: <RobotOutlined />,
      label: '上传鉴定',
    },
    {
      key: '/stamps',
      icon: <BookOutlined />,
      label: '邮票库',
    },
    {
      key: '/auth',
      icon: <RobotOutlined />,
      label: 'AI鉴定',
    },
    {
      key: '/community',
      icon: <TeamOutlined />,
      label: '社区',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => handleLogout(),
    },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#001529',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'PM' : 'PostMind'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={notifications.length} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                onClick={() => navigate('/notifications')}
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <Avatar 
                  src={user?.avatar} 
                  icon={<UserOutlined />}
                  style={{ marginRight: 8 }}
                />
                <span>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: '#fff',
          borderRadius: 8
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;