import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, message, Spin, QRCode } from 'antd';
import { MobileOutlined, QrcodeOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const MobileUpload: React.FC = () => {
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();

  // Generate session and QR code on component mount
  useEffect(() => {
    generateUploadSession();
    
    return () => {
      if (polling) {
        stopPolling();
      }
    };
  }, []);

  const generateUploadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate unique session ID
      const newSessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Generate upload URL (for mobile)
      const baseUrl = window.location.origin;
      const newUploadUrl = `${baseUrl}/mobile-upload?session=${newSessionId}`;
      setUploadUrl(newUploadUrl);
      
      // Start polling for uploaded images
      startPolling(newSessionId);
      
    } catch (err) {
      console.error('Session generation error:', err);
      setError('生成上传会话失败，请重试');
      message.error('会话创建失败');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (sessionId: string) => {
    setPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        // Check for uploaded images via API
        const response = await fetch(`/api/v1/upload/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            setUploadedImages(data.images);
            if (data.images.length > 0) {
              stopPolling();
              message.success('检测到新上传的图片！');
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Store interval ID to clear later
    (window as any).uploadPollInterval = pollInterval;
  };

  const stopPolling = () => {
    setPolling(false);
    if ((window as any).uploadPollInterval) {
      clearInterval((window as any).uploadPollInterval);
      (window as any).uploadPollInterval = null;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl);
      setCopied(true);
      message.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    // Navigate to AI authentication with selected image
    navigate('/auth', { state: { uploadedImage: imageUrl } });
  };

  const refreshSession = () => {
    stopPolling();
    setUploadedImages([]);
    generateUploadSession();
  };

  const goBack = () => {
    stopPolling();
    navigate('/upload');
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <MobileOutlined /> 移动端拍照上传
        </Title>
        <Paragraph>
          使用手机扫描二维码或访问链接，直接拍照上传邮票图片
        </Paragraph>
      </Card>

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24 }}>
              正在生成上传链接...
            </Title>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={4}>扫描二维码上传</Title>
              <div style={{ 
                display: 'inline-block', 
                padding: 16, 
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                marginBottom: 16
              }}>
                {uploadUrl && (
                  <QRCode 
                    value={uploadUrl} 
                    size={200}
                    style={{ margin: '0 auto' }}
                  />
                )}
              </div>
              <Paragraph type="secondary">
                使用手机扫描上方二维码，或点击下方链接访问上传页面
              </Paragraph>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>上传链接</Title>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: 12,
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
                border: '1px solid #d9d9d9'
              }}>
                <Text 
                  code 
                  style={{ flex: 1, wordBreak: 'break-all' }}
                >
                  {uploadUrl}
                </Text>
                <Button
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copyToClipboard}
                  type={copied ? 'primary' : 'default'}
                >
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>已上传的图片 ({uploadedImages.length})</Title>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: 16 
                }}>
                  {uploadedImages.map((image, index) => (
                    <div 
                      key={index}
                      style={{ 
                        textAlign: 'center',
                        padding: 8,
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => handleImageSelect(image)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1890ff';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <img
                        src={image}
                        alt={`上传图片 ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: 120, 
                          objectFit: 'cover',
                          borderRadius: 4,
                          marginBottom: 8
                        }}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        选择此图片
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {polling && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 24,
                gap: 8
              }}>
                <Spin size="small" />
                <Text type="secondary">正在等待上传...</Text>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  icon={<QrcodeOutlined />}
                  onClick={refreshSession}
                  disabled={loading}
                >
                  刷新二维码
                </Button>
                <Button size="large" onClick={goBack}>
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

export default MobileUpload;