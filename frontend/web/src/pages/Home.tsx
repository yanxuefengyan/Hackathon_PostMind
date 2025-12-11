import React from 'react';
import { Card, Row, Col, Button, Statistic, Typography, Space } from 'antd';
import {
  BookOutlined,
  RobotOutlined,
  TeamOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <RobotOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: '多方式上传',
      description: '支持摄像头拍摄、本地上传、手机扫码等多种上传方式',
      action: () => navigate('/upload'),
      buttonText: '开始上传',
    },
    {
      icon: <BookOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: '邮票数据库',
      description: '收录全球邮票信息，支持多维度检索和智能分类',
      action: () => navigate('/stamps'),
      buttonText: '浏览邮票',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      title: '集邮社区',
      description: '与全球集邮爱好者交流，分享收藏心得',
      action: () => navigate('/community'),
      buttonText: '进入社区',
    },
  ];

  const stats = [
    {
      title: '邮票收录',
      value: 12580,
      suffix: '枚',
    },
    {
      title: '鉴定次数',
      value: 8642,
      suffix: '次',
    },
    {
      title: '活跃用户',
      value: 3216,
      suffix: '人',
    },
    {
      title: '准确率',
      value: 95.8,
      suffix: '%',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 0',
        borderRadius: 8,
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          邮迹寻踪 PostMind
        </Title>
        <Title level={3} style={{ color: 'white', fontWeight: 400, marginBottom: 32 }}>
          AI赋能集邮文化 · 全场景智能互动平台
        </Title>
        <Paragraph style={{ color: 'white', fontSize: 16, maxWidth: 600, margin: '0 auto 32px' }}>
          基于文心大模型与Agent智能体技术，打造邮票真伪鉴定、AR情景再现、
          数字化收藏管理的一站式集邮平台
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            icon={<RobotOutlined />}
            onClick={() => navigate('/upload')}
            style={{ background: 'white', color: '#1890ff', borderColor: 'white' }}
          >
            开始上传鉴定
          </Button>
          <Button 
            size="large" 
            ghost
            icon={<BookOutlined />}
            onClick={() => navigate('/stamps')}
          >
            浏览邮票库
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Features */}
      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: 32 }}
            >
              <div style={{ marginBottom: 16 }}>
                {feature.icon}
              </div>
              <Title level={4} style={{ marginBottom: 16 }}>
                {feature.title}
              </Title>
              <Paragraph style={{ color: '#666', marginBottom: 24 }}>
                {feature.description}
              </Paragraph>
              <Button 
                type="primary" 
                icon={<ArrowRightOutlined />}
                onClick={feature.action}
              >
                {feature.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;