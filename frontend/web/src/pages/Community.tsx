import React from 'react';
import { Card, Row, Col, Typography, Button, Avatar, Tag, Space } from 'antd';
import { PlusOutlined, MessageOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Community: React.FC = () => {
  const posts = [
    {
      id: 1,
      title: '新手入门：如何开始集邮收藏？',
      content: '作为一个集邮新手，我想知道应该如何开始自己的收藏之路...',
      author: {
        name: '集邮爱好者',
        avatar: '',
        level: 3
      },
      category: 'discussion',
      tags: ['新手', '入门', '收藏'],
      stats: {
        views: 156,
        likes: 23,
        comments: 8
      },
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: '展示我的珍贵邮票收藏',
      content: '今天给大家展示一下我收藏的一些珍贵邮票，包括1980年的猴票...',
      author: {
        name: '邮票收藏家',
        avatar: '',
        level: 8
      },
      category: 'showcase',
      tags: ['收藏展示', '珍贵邮票', '猴票'],
      stats: {
        views: 342,
        likes: 67,
        comments: 15
      },
      createdAt: '2024-01-14'
    },
    {
      id: 3,
      title: '求助：这张邮票的真伪如何判断？',
      content: '最近从古玩市场买到一张邮票，不确定真假，请各位专家帮忙鉴定...',
      author: {
        name: '新手小白',
        avatar: '',
        level: 1
      },
      category: 'question',
      tags: ['真伪鉴定', '求助', '专家'],
      stats: {
        views: 89,
        likes: 12,
        comments: 23
      },
      createdAt: '2024-01-13'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      discussion: 'blue',
      showcase: 'green',
      question: 'orange',
      news: 'red',
      tutorial: 'purple'
    };
    return colors[category] || 'default';
  };

  const getCategoryText = (category: string) => {
    const texts: { [key: string]: string } = {
      discussion: '讨论',
      showcase: '展示',
      question: '提问',
      news: '新闻',
      tutorial: '教程'
    };
    return texts[category] || category;
  };

  return (
    <div>
      {/* 页面标题和操作 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>集邮社区</Title>
            <Paragraph type="secondary">
              与全球集邮爱好者交流分享，共同成长
            </Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            发布帖子
          </Button>
        </div>
      </Card>

      {/* 社区统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>1,234</div>
              <div style={{ color: '#666' }}>活跃用户</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>5,678</div>
              <div style={{ color: '#666' }}>帖子总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>12,345</div>
              <div style={{ color: '#666' }}>评论总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>98.5%</div>
              <div style={{ color: '#666' }}>满意度</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 帖子列表 */}
      <Row gutter={[16, 16]}>
        {posts.map((post) => (
          <Col xs={24} key={post.id}>
            <Card
              hoverable
              style={{ cursor: 'pointer' }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Title level={4} style={{ margin: 0, marginRight: 8 }}>
                      {post.title}
                    </Title>
                    <Tag color={getCategoryColor(post.category)} size="small">
                      {getCategoryText(post.category)}
                    </Tag>
                  </div>
                  
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false }}
                    style={{ color: '#666', marginBottom: 12 }}
                  >
                    {post.content}
                  </Paragraph>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <Space>
                      <Avatar
                        src={post.author.avatar}
                        icon={<div style={{ fontSize: 12 }}>{post.author.name[0]}</div>}
                        size="small"
                      />
                      <span style={{ fontSize: 14, color: '#666' }}>{post.author.name}</span>
                      <Tag color="gold" size="small">Lv.{post.author.level}</Tag>
                    </Space>
                    <span style={{ fontSize: 12, color: '#999' }}>{post.createdAt}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {post.tags.map((tag, index) => (
                      <Tag key={index} size="small">{tag}</Tag>
                    ))}
                  </div>

                  <Space size="large">
                    <span style={{ fontSize: 14, color: '#666' }}>
                      <EyeOutlined /> {post.stats.views}
                    </span>
                    <span style={{ fontSize: 14, color: '#666' }}>
                      <HeartOutlined /> {post.stats.likes}
                    </span>
                    <span style={{ fontSize: 14, color: '#666' }}>
                      <MessageOutlined /> {post.stats.comments}
                    </span>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 加载更多 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button>加载更多</Button>
      </div>
    </div>
  );
};

export default Community;