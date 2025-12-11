import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Input, Select, Button, Image, Tag, Empty, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchStamps, setFilters } from '../store/slices/stampSlice';

const { Option } = Select;
const { Search } = Input;

const StampList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { stamps, loading, pagination, filters } = useSelector((state: RootState) => state.stamps);
  const [searchText, setSearchText] = useState(filters.search || '');

  useEffect(() => {
    dispatch(fetchStamps(filters));
  }, [dispatch, filters]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    dispatch(setFilters({ search: value, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ category: category === 'all' ? undefined : category, page: 1 }));
  };

  const handleRarityChange = (rarity: string) => {
    dispatch(setFilters({ rarity: rarity === 'all' ? undefined : rarity, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

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

  return (
    <div>
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索邮票名称、代码或描述"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="分类"
              value={filters.category || 'all'}
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
            >
              <Option value="all">全部分类</Option>
              <Option value="普通邮票">普通邮票</Option>
              <Option value="纪念邮票">纪念邮票</Option>
              <Option value="特种邮票">特种邮票</Option>
              <Option value="欠资邮票">欠资邮票</Option>
              <Option value="航空邮票">航空邮票</Option>
              <Option value="军用邮票">军用邮票</Option>
              <Option value="慈善邮票">慈善邮票</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="稀有度"
              value={filters.rarity || 'all'}
              onChange={handleRarityChange}
              style={{ width: '100%' }}
            >
              <Option value="all">全部稀有度</Option>
              <Option value="common">普通</Option>
              <Option value="uncommon">少见</Option>
              <Option value="rare">稀有</Option>
              <Option value="very_rare">极稀有</Option>
              <Option value="legendary">传说</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 邮票列表 */}
      <Spin spinning={loading}>
        {stamps.length === 0 ? (
          <Empty description="暂无邮票数据" />
        ) : (
          <Row gutter={[16, 16]}>
            {stamps.map((stamp) => (
              <Col xs={24} sm={12} md={8} lg={6} key={stamp.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      {stamp.images && stamp.images.length > 0 ? (
                        <Image
                          src={stamp.images[0]}
                          alt={stamp.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ color: '#999', textAlign: 'center' }}>
                          <div style={{ fontSize: 48 }}>📮</div>
                          <div>暂无图片</div>
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/stamps/${stamp.id}`)}
                    >
                      查看
                    </Button>,
                    <Button
                      type="text"
                      icon={<HeartOutlined />}
                    >
                      收藏
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ flex: 1 }}>{stamp.name}</span>
                        <Tag color={getRarityColor(stamp.rarity)} size="small">
                          {getRarityText(stamp.rarity)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ color: '#666', marginBottom: 4 }}>
                          {stamp.code} • {stamp.country}
                        </div>
                        <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                          {stamp.category}
                        </div>
                        {stamp.marketValue && (
                          <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                            ¥{stamp.marketValue}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            上一页
          </Button>
          <span style={{ margin: '0 16px' }}>
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>
          <Button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default StampList;