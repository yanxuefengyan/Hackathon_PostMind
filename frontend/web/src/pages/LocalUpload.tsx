import React, { useState } from 'react';
import { Card, Upload, Button, Typography, Space, Image, Alert, Progress, message } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

const LocalUpload: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过10MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange(info) {
      setFileList(info.fileList.slice(-1)); // 只保留最后一个文件
      setError(null);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove() {
      setFileList([]);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请选择要上传的图片！');
      return;
    }

    const file = fileList[0];
    if (!file.originFileObj) {
      message.error('文件信息错误，请重新选择！');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file.originFileObj);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/v1/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        message.success('图片上传成功！');
        
        // Navigate to AI authentication with uploaded image
        setTimeout(() => {
          navigate('/auth', { state: { uploadedImage: result.fileUrl } });
        }, 500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || '图片上传失败，请重试');
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (file: UploadFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else if (file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj);
      window.open(url, '_blank');
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setUploadProgress(0);
    setError(null);
  };

  const goBack = () => {
    navigate('/upload');
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UploadOutlined /> 本地图片上传
        </Title>
        <Paragraph>
          从本地选择图片文件进行上传，支持JPG、PNG、GIF等常见格式
        </Paragraph>
      </Card>

      {error && (
        <Alert
          message="上传失败"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        {!fileList.length ? (
          <div>
            <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个文件上传，文件格式：JPG、JPEG、PNG、GIF，文件大小不超过10MB
              </p>
            </Dragger>

            <div style={{ textAlign: 'center' }}>
              <Button size="large" onClick={goBack}>
                返回
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>已选择文件</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ 
                  padding: 16, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 8,
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong>{fileList[0].name}</Text>
                      <br />
                      <Text type="secondary">
                        {fileList[0].size && `${(fileList[0].size / 1024 / 1024).toFixed(2)} MB`}
                      </Text>
                    </div>
                    <Space>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(fileList[0])}
                      >
                        预览
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemove}
                      >
                        删除
                      </Button>
                    </Space>
                  </div>
                </div>

                {fileList[0].originFileObj && (
                  <div style={{ maxWidth: 400, margin: '0 auto' }}>
                    <Image
                      src={URL.createObjectURL(fileList[0].originFileObj)}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                    />
                  </div>
                )}
              </Space>
            </div>

            {uploading && (
              <div style={{ marginBottom: 24 }}>
                <Text>上传进度</Text>
                <Progress percent={uploadProgress} status="active" />
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : '开始上传'}
                </Button>
                <Button
                  size="large"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  重新选择
                </Button>
                <Button size="large" onClick={goBack} disabled={uploading}>
                  返回
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocalUpload;