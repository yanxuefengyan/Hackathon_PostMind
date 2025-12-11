import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Typography, Space, Alert, Spin, message, List, Result } from 'antd';
import { CameraOutlined, ReloadOutlined, UploadOutlined, StopOutlined, SwapOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const CameraDiagnosis: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCamera, setCurrentCamera] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // 诊断摄像头功能
  const runDiagnosis = async () => {
    const results = [];
    
    // 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      results.push({
        status: 'error',
        title: '浏览器支持',
        description: '您的浏览器不支持摄像头功能，请使用Chrome、Firefox或Edge浏览器'
      });
      setDiagnosticResults(results);
      return;
    } else {
      results.push({
        status: 'success',
        title: '浏览器支持',
        description: '浏览器支持摄像头功能'
      });
    }

    // 检查HTTPS
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      results.push({
        status: 'warning',
        title: '安全连接',
        description: '建议使用HTTPS连接访问摄像头功能'
      });
    } else {
      results.push({
        status: 'success',
        title: '安全连接',
        description: '连接安全，支持摄像头访问'
      });
    }

    // 检查可用摄像头
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        results.push({
          status: 'error',
          title: '摄像头设备',
          description: '未检测到任何摄像头设备，请确保摄像头已连接'
        });
      } else {
        results.push({
          status: 'success',
          title: '摄像头设备',
          description: `检测到 ${videoDevices.length} 个摄像头设备`
        });
      }
      
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !currentCamera) {
        setCurrentCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      results.push({
        status: 'error',
        title: '摄像头检测',
        description: '无法检测摄像头设备'
      });
    }

    setDiagnosticResults(results);
  };

  const startCamera = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // 首先检查浏览器是否支持getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持摄像头功能');
      }

      // 尝试获取摄像头权限和流
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      // 立即设置视频流并更新状态
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // 立即更新状态
        setIsStreaming(true);
        setLoading(false);
        
        // 等待视频元数据加载完成后播放
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(playErr => {
              console.error('Video play error:', playErr);
              setError('视频播放失败，请重试');
            });
          }
        };
        
        // 设置超时处理
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState < 2) {
            setError('摄像头加载超时，请重试');
            setIsStreaming(false);
            setLoading(false);
          }
        }, 5000);
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Camera access error:', err);
      let errorMessage = '无法访问摄像头，请确保已授予权限且摄像头未被其他应用占用';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '未检测到摄像头设备，请确保摄像头已连接';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '摄像头被其他应用占用，请关闭其他使用摄像头的应用';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = '摄像头不满足要求的约束条件';
      }
      
      setError(errorMessage);
      message.error(errorMessage);
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

  // 组件挂载时运行诊断
  React.useEffect(() => {
    runDiagnosis();
  }, []);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CameraOutlined /> 摄像头诊断与拍摄
        </Title>
        <Paragraph>
          智能诊断摄像头功能，提供详细的错误分析和解决方案
        </Paragraph>
      </Card>

      {/* 诊断结果 */}
      {diagnosticResults.length > 0 && (
        <Card title="诊断结果" style={{ marginBottom: 24 }}>
          <List
            dataSource={diagnosticResults}
            renderItem={(item) => (
              <List.Item>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {item.status === 'success' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 12, fontSize: 18 }} />
                  ) : item.status === 'warning' ? (
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 12, fontSize: 18 }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: 12, fontSize: 18 }} />
                  )}
                  <div>
                    <Text strong>{item.title}</Text>
                    <br />
                    <Text type="secondary">{item.description}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

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
                <Title level={3}>摄像头准备</Title>
                <Paragraph style={{ color: '#666', marginBottom: 32 }}>
                  基于诊断结果，点击下方按钮启动摄像头
                </Paragraph>
                <Space direction="vertical" size="large">
                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CameraOutlined />}
                      onClick={startCamera}
                      loading={loading}
                      disabled={diagnosticResults.some(r => r.status === 'error')}
                    >
                      启动摄像头
                    </Button>
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={runDiagnosis}
                    >
                      重新诊断
                    </Button>
                  </Space>
                  
                  {/* 备选方案 */}
                  <Card size="small" title="备选方案">
                    <Space direction="vertical">
                      <Button 
                        size="large" 
                        icon={<UploadOutlined />}
                        onClick={() => navigate('/upload/local')}
                      >
                        本地图片上传
                      </Button>
                      <Text type="secondary">
                        如果摄像头无法正常工作，可以选择本地图片上传
                      </Text>
                    </Space>
                  </Card>
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
            <Result
              status="success"
              title="拍照成功！"
              subTitle="图片已准备就绪，可以进行上传分析"
              extra={[
                <Button
                  key="upload"
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={uploadPhoto}
                  loading={loading}
                >
                  {loading ? '上传中...' : '上传图片'}
                </Button>,
                <Button
                  key="retake"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => setCapturedImage(null)}
                >
                  重新拍摄
                </Button>
              ]}
            >
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: 8,
                  marginTop: 24
                }}
              />
            </Result>
          </div>
        )}
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraDiagnosis;
