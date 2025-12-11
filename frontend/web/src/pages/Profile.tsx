import React from 'react';
import { Card, Row, Col, Avatar, Typography, Descriptions, Tag, Button, Space } from 'antd';
import { UserOutlined, EditOutlined, SettingOutlined, TrophyOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <div>用户信息加载中...</div>;
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      user: 'blue',
      admin: 'red',
      expert: 'purple'
    };
    return colors[role] || 'default';
  };

  const getRoleText = (role: string) => {
    const texts: { [key: string]: string } = {
      user: '普通用户',
      admin: '管理员',
      expert: '专家'
    };
    return texts[role] || role;
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 用户基本信息 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                src={user.avatar}
                icon={<UserOutlined />}
                size={120}
                style={{ marginBottom: 16 }}
              />
              <Title level={3}>{user.username}</Title>
              <Tag color={getRoleColor(user.role)} style={{ marginBottom: 16 }}>
                {getRoleText(user.role)}
              </Tag>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                {user.bio || '这个人很懒，还没有填写个人简介'}
              </Paragraph>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" icon={<EditOutlined />} block>
                  编辑资料
                </Button>
                <Button icon={<SettingOutlined />} block>
                  账户设置
                </Button>
              </Space>
            </div>
          </Card>

          {/* 用户统计 */}
          <Card title="数据统计" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {user.level || 1}
              </div>
              <div style={{ color: '#666', marginBottom: 16 }}>
                当前等级
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {user.experience || 0}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    经验值
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    0
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    收藏品
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* 详细信息 */}
        <Col xs={24} md={16}>
          <Card title="个人信息">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="用户名">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {user.email}
              </Descriptions.Item>
              {user.phone && (
                <Descriptions.Item label="手机号">
                  {user.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="用户角色">
                <Tag color={getRoleColor(user.role)}>
                  {getRoleText(user.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户等级">
                <Tag color="gold">Level {user.level || 1}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="经验值">
                {user.experience || 0} XP
              </Descriptions.Item>
              {user.bio && (
                <Descriptions.Item label="个人简介">
                  {user.bio}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📮</div>
                  <Title level={5}>我的收藏</Title>
                  <Paragraph type="secondary">
                    管理您的邮票收藏
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <Title level={5}>鉴定记录</Title>
                  <Paragraph type="secondary">
                    查看AI鉴定历史
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  <Title level={5}>我的帖子</Title>
                  <Paragraph type="secondary">
                    管理社区帖子
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
                  <Title level={5}>账户设置</Title>
                  <Paragraph type="secondary">
                    修改密码和安全设置
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;