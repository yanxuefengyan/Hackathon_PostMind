import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Tag, Button, Typography, Space, Input, Select, Tabs } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { ListProps } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  tags: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  createdAt: string;
  images?: string[];
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: '清代红印花加盖邮票真伪讨论',
    content: '最近收到一枚清代红印花加盖邮票，想请教各位藏友关于真伪鉴别的问题。这枚邮票的纸质、印刷和齿孔都有些特殊...',
    category: 'discussion',
    author: {
      id: '1',
      name: '集邮爱好者',
      level: 5,
    },
    tags: ['清代', '红印花', '真伪鉴别'],
    stats: {
      views: 234,
      likes: 12,
      comments: 8,
    },
    createdAt: '2023-12-10 14:30',
  },
  {
    id: '2',
    title: '展示我的民国邮票收藏',
    content: '收集民国邮票已有十年，今天想和大家分享一下我的收藏成果。这些邮票记录了那个特殊年代的历史...',
    category: 'showcase',
    author: {
      id: '2',
      name: '邮票收藏家',
      level: 8,
    },
    tags: ['民国', '收藏展示', '历史邮票'],
    stats: {
      views: 567,
      likes: 45,
      comments: 23,
    },
    createdAt: '2023-12-10 10:15',
  },
  {
    id: '3',
    title: '如何鉴别文革邮票的真伪？',
    content: '文革邮票市场上有大量仿品，想请教有经验的前辈，除了纸张和印刷外，还有哪些鉴别要点...',
    category: 'question',
    author: {
      id: '3',
      name: '新手藏友',
      level: 2,
    },
    tags: ['文革', '真伪鉴别', '求教'],
    stats: {
      views: 123,
      likes: 8,
      comments: 15,
    },
    createdAt: '2023-12-09 16:45',
  },
];

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'discussion', label: '讨论' },
    { key: 'showcase', label: '展示' },
    { key: 'question', label: '问答' },
    { key: 'news', label: '资讯' },
    { key: 'tutorial', label: '教程' },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      discussion: 'blue',
      showcase: 'green',
      question: 'orange',
      news: 'red',
      tutorial: 'purple',
    };
    return colors[category] || 'default';
  };

  const getCategoryText = (category: string) => {
    const texts: { [key: string]: string } = {
      discussion: '讨论',
      showcase: '展示',
      question: '问答',
      news: '资讯',
      tutorial: '教程',
    };
    return texts[category] || category;
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // 实际项目中这里会调用API搜索
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // 实际项目中这里会调用API筛选
  };

  const handlePostClick = (postId: string) => {
    navigate(`/community/post/${postId}`);
  };

  const handleNewPost = () => {
    navigate('/community/new');
  };

  const renderPostItem = (item: Post) => (
    <List.Item
      key={item.id}
      style={{ cursor: 'pointer', padding: '16px 0' }}
      onClick={() => handlePostClick(item.id)}
    >
      <Card style={{ width: '100%' }} bodyStyle={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0, marginRight: 8 }}>
                {item.title}
              </Title>
              <Tag color={getCategoryColor(item.category)}>
                {getCategoryText(item.category)}
              </Tag>
            </div>
            
            <Paragraph
              ellipsis={{ rows: 2, expandable: false }}
              style={{ marginBottom: 12, color: '#666' }}
            >
              {item.content}
            </Paragraph>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Avatar
                  src={item.author.avatar}
                  icon={<div style={{ fontSize: 12 }}>{item.author.name[0]}</div>}
                  size="small"
                />
                <span style={{ fontSize: 14, color: '#666' }}>{item.author.name}</span>
                <Tag color="gold">Lv.{item.author.level}</Tag>
              </Space>
              <span style={{ fontSize: 12, color: '#999' }}>{item.createdAt}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {item.tags.map((tag, index) => (
                <Tag key={index} style={{ fontSize: 12 }}>
                  {tag}
                </Tag>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <Space>
                <EyeOutlined style={{ color: '#666' }} />
                <Text type="secondary">{item.stats.views}</Text>
              </Space>
              <Space>
                <LikeOutlined style={{ color: '#666' }} />
                <Text type="secondary">{item.stats.likes}</Text>
              </Space>
              <Space>
                <MessageOutlined style={{ color: '#666' }} />
                <Text type="secondary">{item.stats.comments}</Text>
              </Space>
            </div>
          </div>
        </div>
      </Card>
    </List.Item>
  );

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            集邮社区
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewPost}
          >
            发布新帖
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Search
            placeholder="搜索帖子标题或内容"
            allowClear
            enterButton
            style={{ flex: 1 }}
            onSearch={handleSearch}
          />
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{ width: 120 }}
          >
            {categories.map(cat => (
              <Option key={cat.key} value={cat.key}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </div>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="热门" key="hot" />
          <TabPane tab="最新" key="latest" />
          <TabPane tab="关注" key="following" />
        </Tabs>
      </Card>

      <List
        loading={loading}
        dataSource={filteredPosts}
        renderItem={renderPostItem}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条帖子`,
        }}
      />
    </div>
  );
};

export default Community;