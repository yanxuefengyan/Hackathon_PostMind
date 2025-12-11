import React, { useState } from 'react';
import { Card, Upload, Button, Typography, Steps, Result, Spin, Tag, Alert } from 'antd';
import { UploadOutlined, RobotOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

interface AuthenticationResult {
  result: 'authentic' | 'fake' | 'uncertain';
  confidence: number;
  analysis: {
    paperQuality: number;
    printingQuality: number;
    colorAccuracy: number;
    perforation: number;
    overall: number;
  };
  features: {
    detectedFeatures: string[];
    anomalies: string[];
    similarities: string[];
  };
  processingTime: number;
}

const AIAuthentication: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AuthenticationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const uploadProps: UploadProps = {
    name: 'images',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        alert('只能上传图片文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        alert('图片大小不能超过10MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange(info) {
      setFileList(info.fileList.slice(-5)); // 最多保留5个文件
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      alert('请至少上传一张图片！');
      return;
    }

    setUploading(true);
    setCurrentStep(1);

    // 模拟AI鉴定过程
    setTimeout(() => {
      const mockResult: AuthenticationResult = {
        result: Math.random() > 0.3 ? 'authentic' : Math.random() > 0.5 ? 'fake' : 'uncertain',
        confidence: Math.floor(Math.random() * 30) + 70,
        analysis: {
          paperQuality: Math.floor(Math.random() * 30) + 70,
          printingQuality: Math.floor(Math.random() * 30) + 70,
          colorAccuracy: Math.floor(Math.random() * 30) + 70,
          perforation: Math.floor(Math.random() * 30) + 70,
          overall: Math.floor(Math.random() * 30) + 70,
        },
        features: {
          detectedFeatures: ['水印', '齿孔', '纸张纹理', '印刷网点'],
          anomalies: [],
          similarities: ['印刷特征匹配', '纸张类型一致'],
        },
        processingTime: Math.floor(Math.random() * 5000) + 2000,
      };

      if (mockResult.result === 'fake') {
        mockResult.features.anomalies = ['颜色偏差', '纸张质量异常'];
        mockResult.features.similarities = [];
      }

      setResult(mockResult);
      setCurrentStep(2);
      setUploading(false);
    }, 3000);
  };

  const resetUpload = () => {
    setFileList([]);
    setResult(null);
    setCurrentStep(0);
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.result) {
      case 'authentic':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 64 }} />;
      case 'fake':
        return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 64 }} />;
      default:
        return <RobotOutlined style={{ color: '#fa8c16', fontSize: 64 }} />;
    }
  };

  const getResultText = () => {
    if (!result) return '';
    switch (result.result) {
      case 'authentic':
        return '鉴定结果：真品';
      case 'fake':
        return '鉴定结果：赝品';
      default:
        return '鉴定结果：不确定';
    }
  };

  const getResultColor = () => {
    if (!result) return 'default';
    switch (result.result) {
      case 'authentic':
        return 'success';
      case 'fake':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>
          <RobotOutlined /> AI邮票真伪鉴定
        </Title>
        <Paragraph>
          基于文心大模型的智能鉴定系统，通过图像识别和特征分析，
          为您的邮票提供专业的真伪鉴定服务。
        </Paragraph>
      </Card>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Steps.Step title="上传图片" description="选择要鉴定的邮票图片" />
        <Steps.Step title="AI分析" description="系统正在进行智能分析" />
        <Steps.Step title="查看结果" description="鉴定完成，查看详细结果" />
      </Steps>

      {currentStep === 0 && (
        <Card>
          <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传。严格禁止上传公司数据或其他敏感文件。
            </p>
          </Dragger>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={handleUpload}
              disabled={fileList.length === 0}
              loading={uploading}
            >
              开始AI鉴定
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <Title level={3} style={{ marginTop: 24 }}>
            AI正在分析中...
          </Title>
          <Paragraph>
            请稍候，系统正在进行多维度特征分析
          </Paragraph>
        </Card>
      )}

      {currentStep === 2 && result && (
        <Card>
          <Result
            icon={getResultIcon()}
            title={getResultText()}
            subTitle={`置信度：${result.confidence}% | 处理时间：${(result.processingTime / 1000).toFixed(1)}秒`}
            extra={[
              <Button type="primary" key="analyze" onClick={resetUpload}>
                重新鉴定
              </Button>,
            ]}
          />

          <Card title="详细分析结果" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Tag color={getResultColor()} style={{ fontSize: 16, padding: '4px 12px' }}>
                {getResultText()}
              </Tag>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>各项指标评分</Title>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <div>纸张质量</div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{result.analysis.paperQuality}分</div>
                </div>
                <div>
                  <div>印刷质量</div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{result.analysis.printingQuality}分</div>
                </div>
                <div>
                  <div>颜色准确度</div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{result.analysis.colorAccuracy}分</div>
                </div>
                <div>
                  <div>齿孔质量</div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{result.analysis.perforation}分</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>检测到的特征</Title>
              <div>
                {result.features.detectedFeatures.map((feature, index) => (
                  <Tag key={index} color="blue">{feature}</Tag>
                ))}
              </div>
            </div>

            {result.features.anomalies.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>异常特征</Title>
                <Alert
                  message="发现以下异常特征"
                  description={
                    <div>
                      {result.features.anomalies.map((anomaly, index) => (
                        <Tag key={index} color="red">{anomaly}</Tag>
                      ))}
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              </div>
            )}

            {result.features.similarities.length > 0 && (
              <div>
                <Title level={5}>匹配特征</Title>
                <div>
                  {result.features.similarities.map((similarity, index) => (
                    <Tag key={index} color="green">{similarity}</Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Card>
      )}
    </div>
  );
};

export default AIAuthentication;