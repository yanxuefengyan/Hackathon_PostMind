import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Image, Tag, Button, Descriptions, Typography, Spin } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchStampById } from '../store/slices/stampSlice';

const { Title, Paragraph } = Typography;

const StampDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStamp, loading } = useSelector((state: RootState) => state.stamps);

  useEffect(() => {
    if (id) {
      dispatch(fetchStampById(id));
    }
  }, [dispatch, id]);

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: 'gray',
      uncommon: 'green',
      rare: 'blue',
      very_rare: 'purple',
      legendary: 'gold'
    };
    return colors[rarity] || 'default';
  };

  const getRarityText = (rarity: string) => {
    const texts: { [key: string]: string } = {
      common: '普通',
      uncommon: '少见',
      rare: '稀有',
      very_rare: '极稀有',
      legendary: '传说'
    };
    return texts[rarity] || rarity;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentStamp) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Paragraph>邮票不存在</Paragraph>
        <Button onClick={() => navigate('/stamps')}>返回邮票列表</Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/stamps')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Row gutter={[24, 24]}>
        {/* 邮票图片 */}
        <Col xs={24} md={12}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {currentStamp.images && currentStamp.images.length > 0 ? (
                <Image
                  src={currentStamp.images[0]}
                  alt={currentStamp.name}
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
              ) : (
                <div style={{ padding: '100px 0', color: '#999' }}>
                  <div style={{ fontSize: 72 }}>📮</div>
                  <div>暂无图片</div>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Button.Group>
                <Button icon={<HeartOutlined />}>
                  收藏
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  分享
                </Button>
              </Button.Group>
            </div>
          </Card>
        </Col>

        {/* 邮票信息 */}
        <Col xs={24} md={12}>
          <Card>
            <Title level={2}>{currentStamp.name}</Title>
            <div style={{ marginBottom: 16 }}>
              <Tag color={getRarityColor(currentStamp.rarity)} size="large">
                {getRarityText(currentStamp.rarity)}
              </Tag>
              <Tag>{currentStamp.category}</Tag>
              {currentStamp.verified && (
                <Tag color="success">已验证</Tag>
              )}
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="邮票代码">
                {currentStamp.code}
              </Descriptions.Item>
              <Descriptions.Item label="发行国家">
                {currentStamp.country}
              </Descriptions.Item>
              <Descriptions.Item label="面值">
                {currentStamp.denomination} {currentStamp.currency}
              </Descriptions.Item>
              <Descriptions.Item label="发行日期">
                {currentStamp.issueDate ? new Date(currentStamp.issueDate).toLocaleDateString() : '未知'}
              </Descriptions.Item>
              {currentStamp.designer && (
                <Descriptions.Item label="设计师">
                  {currentStamp.designer}
                </Descriptions.Item>
              )}
              {currentStamp.printer && (
                <Descriptions.Item label="印刷厂">
                  {currentStamp.printer}
                </Descriptions.Item>
              )}
              {currentStamp.size && (
                <Descriptions.Item label="尺寸">
                  {currentStamp.size}
                </Descriptions.Item>
              )}
              {currentStamp.perforation && (
                <Descriptions.Item label="齿孔">
                  {currentStamp.perforation}
                </Descriptions.Item>
              )}
              {currentStamp.color && (
                <Descriptions.Item label="颜色">
                  {currentStamp.color}
                </Descriptions.Item>
              )}
              {currentStamp.quantity && (
                <Descriptions.Item label="发行量">
                  {currentStamp.quantity}
                </Descriptions.Item>
              )}
              {currentStamp.marketValue && (
                <Descriptions.Item label="市场价值">
                  <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                    ¥{currentStamp.marketValue}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {currentStamp.description && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>描述</Title>
                <Paragraph>{currentStamp.description}</Paragraph>
              </div>
            )}

            {currentStamp.history && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>历史背景</Title>
                <Paragraph>{currentStamp.history}</Paragraph>
              </div>
            )}

            {currentStamp.tags && currentStamp.tags.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={4}>标签</Title>
                <div>
                  {currentStamp.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StampDetail;