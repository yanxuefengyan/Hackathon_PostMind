import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import {
  CameraOutlined,
  UploadOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const UploadOptions: React.FC = () => {
  const navigate = useNavigate();

  const uploadOptions = [
    {
      icon: <CameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: '电脑摄像头',
      description: '打开电脑摄像头直接拍摄',
      buttonText: '启动摄像头',
      action: () => navigate('/upload/camera'),
    },
    {
      icon: <UploadOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: '本地图片上传',
      description: '从本地选择图片上传分析',
      buttonText: '选择图片',
      action: () => navigate('/upload/local'),
    },
    {
      icon: <MobileOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      title: '移动端拍照',
      description: '手机扫码上传或拍照上传',
      buttonText: '扫码上传',
      action: () => navigate('/upload/mobile'),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={2}>选择上传方式</Title>
        <Paragraph>
          请选择您希望的图片上传方式，支持多种场景下的便捷上传
        </Paragraph>
      </Card>

      <Row gutter={[24, 24]}>
        {uploadOptions.map((option, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '32px 24px' }}
              onClick={option.action}
            >
              <div style={{ marginBottom: 24 }}>
                {option.icon}
              </div>
              <Title level={4} style={{ marginBottom: 16 }}>
                {option.title}
              </Title>
              <Paragraph style={{ color: '#666', marginBottom: 24, minHeight: 48 }}>
                {option.description}
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={option.action}
                style={{ width: '100%' }}
              >
                {option.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default UploadOptions;