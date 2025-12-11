import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Typography, Space, Alert, Spin, message } from 'antd';
import { CameraOutlined, ReloadOutlined, UploadOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const CameraUpload: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('无法访问摄像头，请确保已授予权限且摄像头未被其他应用占用');
      message.error('摄像头访问失败');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const uploadPhoto = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, `camera-capture-${Date.now()}.jpg`);

      // Upload to backend
      const uploadResponse = await fetch('/api/v1/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        message.success('图片上传成功！');
        
        // Navigate to AI authentication with uploaded image
        navigate('/auth', { state: { uploadedImage: result.fileUrl } });
      } else {
        throw new Error('上传失败');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('图片上传失败，请重试');
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    stopCamera();
    navigate('/upload');
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CameraOutlined /> 电脑摄像头拍摄
        </Title>
        <Paragraph>
          使用电脑摄像头拍摄邮票照片，支持实时预览和高清拍摄
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
        {!capturedImage ? (
          <div style={{ textAlign: 'center' }}>
            {!isStreaming ? (
              <div style={{ padding: '60px 0' }}>
                <CameraOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 24 }} />
                <Title level={3}>准备拍照</Title>
                <Paragraph style={{ color: '#666', marginBottom: 32 }}>
                  点击下方按钮启动摄像头，确保光线充足且邮票清晰可见
                </Paragraph>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CameraOutlined />}
                    onClick={startCamera}
                  >
                    启动摄像头
                  </Button>
                  <Button size="large" onClick={goBack}>
                    返回
                  </Button>
                </Space>
              </div>
            ) : (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    borderRadius: 8,
                    marginBottom: 24,
                    border: '2px solid #d9d9d9'
                  }}
                />
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<CameraOutlined />}
                    onClick={capturePhoto}
                  >
                    拍照
                  </Button>
                  <Button
                    size="large"
                    icon={<StopOutlined />}
                    onClick={stopCamera}
                  >
                    停止摄像头
                  </Button>
                  <Button size="large" onClick={goBack}>
                    返回
                  </Button>
                </Space>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: '100%',
                maxWidth: '800px',
                borderRadius: 8,
                marginBottom: 24,
                border: '2px solid #52c41a'
              }}
            />
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={uploadPhoto}
                loading={loading}
              >
                {loading ? '上传中...' : '上传图片'}
              </Button>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={retakePhoto}
              >
                重新拍摄
              </Button>
              <Button size="large" onClick={goBack}>
                返回
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraUpload;