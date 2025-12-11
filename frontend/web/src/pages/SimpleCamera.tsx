import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Typography, Space, Alert, message } from 'antd';
import { CameraOutlined, UploadOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const SimpleCamera: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // 检查摄像头权限
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (err: any) {
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setError('摄像头权限被拒绝。请在浏览器地址栏左侧点击摄像头图标，选择"允许"');
      } else if (err.name === 'NotFoundError') {
        setError('未检测到摄像头设备。请检查摄像头是否已连接并正常工作');
      } else {
        setError('摄像头访问失败：' + err.message);
      }
      return false;
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      
      // 检查video元素是否存在
      console.log('Starting camera, video ref:', videoRef.current);
      if (!videoRef.current) {
        console.error('Video ref is null before getting stream');
        setError('视频元素未找到，请刷新页面重试');
        return;
      }
      
      // 先检查权限
      const hasAccess = await checkCameraPermission();
      if (!hasAccess) {
        return;
      }

      console.log('Getting camera stream...');
      // 获取摄像头流
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false 
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // 等待视频元数据加载完成再设置状态
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, setting isStreaming to true');
          setIsStreaming(true);
          message.success('摄像头已启动');
        };
        
        // 手动触发视频播放
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
          setError('视频播放失败：' + err.message);
        });
      } else {
        console.error('Video ref became null after getting stream');
        setError('视频元素丢失，请刷新页面重试');
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      setError('启动摄像头失败：' + err.message);
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
        message.success('拍照成功！');
      }
    }
  }, [stopCamera]);

  const uploadPhoto = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, `camera-capture-${Date.now()}.jpg`);

      const uploadResponse = await fetch('/api/v1/upload/mobile', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        message.success('图片上传成功！');
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

  React.useEffect(() => {
    // 页面加载时检查权限
    checkCameraPermission();
    
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CameraOutlined /> 简易摄像头拍摄
        </Title>
        <Paragraph>
          简单可靠的摄像头拍照功能，支持多种浏览器
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
                <Title level={3}>
                  {hasPermission === null ? '检查中...' : 
                   hasPermission === false ? '摄像头权限未授权' : '准备拍照'}
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: 32 }}>
                  {hasPermission === false ? 
                    '请点击浏览器地址栏左侧的摄像头图标，选择"允许"，然后刷新页面' :
                    '点击下方按钮启动摄像头进行拍照'}
                </Paragraph>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CameraOutlined />}
                    onClick={startCamera}
                    disabled={hasPermission === false}
                    style={{ width: '200px' }}
                  >
                    启动摄像头
                  </Button>
                  
                  {hasPermission === false && (
                    <div>
                      <Paragraph style={{ color: '#ff4d4f', textAlign: 'center' }}>
                        <strong>权限设置步骤：</strong><br/>
                        1. 点击浏览器地址栏左侧的摄像头图标<br/>
                        2. 选择"允许"访问摄像头<br/>
                        3. 刷新此页面
                      </Paragraph>
                    </div>
                  )}

                  <Card size="small" title="备选方案">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        size="large" 
                        icon={<UploadOutlined />}
                        onClick={() => navigate('/upload/local')}
                        style={{ width: '100%' }}
                      >
                        本地图片上传
                      </Button>
                      <Button 
                        size="large" 
                        onClick={() => navigate('/upload')}
                        style={{ width: '100%' }}
                      >
                        返回上传选择
                      </Button>
                    </Space>
                  </Card>
                </Space>
              </div>
            ) : (
              <div>
                {/* 调试信息显示 */}
                <div style={{ 
                  background: '#f0f0f0', 
                  padding: '10px', 
                  marginBottom: '20px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  <div>调试信息:</div>
                  <div>isStreaming: {String(isStreaming)}</div>
                  <div>videoRef.current: {videoRef.current ? 'exists' : 'null'}</div>
                  <div>streamRef.current: {streamRef.current ? 'exists' : 'null'}</div>
                  <div>hasPermission: {String(hasPermission)}</div>
                </div>

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    borderRadius: 8,
                    marginBottom: 24,
                    border: '2px solid #d9d9d9',
                    backgroundColor: '#000'
                  }}
                />
                
                {/* 强制显示按钮区域 */}
                <div style={{ 
                  padding: '20px', 
                  background: '#fff', 
                  border: '2px solid #1890ff', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>
                    摄像头控制按钮
                  </div>
                  <Space size="large" wrap>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CameraOutlined />}
                      onClick={capturePhoto}
                      style={{ minWidth: '120px' }}
                    >
                      拍照
                    </Button>
                    <Button
                      size="large"
                      icon={<StopOutlined />}
                      onClick={stopCamera}
                      style={{ minWidth: '120px' }}
                    >
                      停止摄像头
                    </Button>
                    <Button 
                      size="large" 
                      onClick={goBack}
                      style={{ minWidth: '120px' }}
                    >
                      返回
                    </Button>
                  </Space>
                </div>

                {/* 备用按钮区域 */}
                <div style={{ 
                  padding: '16px', 
                  background: '#fffbf0', 
                  border: '1px solid #ffe58f', 
                  borderRadius: '4px'
                }}>
                  <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                    如果上方按钮无法点击，请尝试这里：
                  </div>
                  <Space>
                    <Button 
                      type="dashed"
                      onClick={() => {
                        console.log('手动调用 capturePhoto');
                        capturePhoto();
                      }}
                    >
                      手动拍照
                    </Button>
                    <Button 
                      type="dashed"
                      onClick={() => {
                        console.log('手动调用 stopCamera');
                        stopCamera();
                      }}
                    >
                      手动停止
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>拍照完成！</Title>
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: '100%',
                maxWidth: '400px',
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
                onClick={() => setCapturedImage(null)}
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

export default SimpleCamera;
