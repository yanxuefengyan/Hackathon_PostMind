const axios = require('axios');
const fs = require('fs');

class WenxinService {
  constructor() {
    this.apiKey = process.env.WENXIN_API_KEY;
    this.secretKey = process.env.WENXIN_SECRET_KEY;
    this.baseUrl = process.env.WENXIN_BASE_URL || 'https://aip.baidubce.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // 获取访问令牌
  async getAccessToken() {
    try {
      // 检查token是否过期
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const url = `${this.baseUrl}/oauth/2.0/token`;
      const params = {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.secretKey
      };

      const response = await axios.get(url, { params });
      const { access_token, expires_in } = response.data;

      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + (expires_in - 300) * 1000; // 提前5分钟过期

      return this.accessToken;
    } catch (error) {
      console.error('获取文心大模型访问令牌失败:', error);
      throw new Error('无法获取访问令牌');
    }
  }

  // 图片分析 - 邮票真伪鉴定
  async analyzeStampImage(imagePath, prompt = '请分析这张邮票图片的真伪，包括纸张质量、印刷特征、颜色准确性等方面') {
    try {
      const accessToken = await this.getAccessToken();
      
      // 将图片转换为base64
      const imageBase64 = this.imageToBase64(imagePath);
      
      const url = `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-bot-4`;
      
      const requestData = {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: parseFloat(process.env.AI_TEMPERATURE || 0.7),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || 2000)
      };

      const response = await axios.post(url, requestData, {
        params: { access_token: accessToken },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.error('文心大模型图片分析失败:', error);
      throw new Error('AI图片分析失败');
    }
  }

  // 文本分析 - 邮票信息提取
  async analyzeStampText(text) {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-bot-4`;
      
      const requestData = {
        messages: [
          {
            role: 'user',
            content: `请分析以下邮票相关信息，提取关键特征：${text}`
          }
        ],
        temperature: parseFloat(process.env.AI_TEMPERATURE || 0.7),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || 2000)
      };

      const response = await axios.post(url, requestData, {
        params: { access_token: accessToken },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.error('文心大模型文本分析失败:', error);
      throw new Error('AI文本分析失败');
    }
  }

  // 将图片转换为base64
  imageToBase64(imagePath) {
    try {
      // 处理完整路径
      const fullPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const imageBuffer = fs.readFileSync(fullPath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('图片转换base64失败:', error);
      throw new Error('图片处理失败');
    }
  }

  // 解析AI响应为结构化数据
  parseAIResponse(aiResponse) {
    try {
      const content = aiResponse.result || '';
      
      // 简单的响应解析（实际项目中可能需要更复杂的解析逻辑）
      const isAuthentic = content.includes('真品') || content.includes('正品');
      const isFake = content.includes('仿品') || content.includes('假货') || content.includes('伪造');
      
      let result = 'uncertain';
      if (isAuthentic) result = 'authentic';
      else if (isFake) result = 'fake';

      // 提取置信度（基于关键词匹配）
      const confidence = this.calculateConfidence(content, result);

      return {
        result,
        confidence,
        analysis: {
          content,
          summary: this.extractSummary(content)
        },
        features: this.extractFeatures(content),
        processingTime: Date.now()
      };

    } catch (error) {
      console.error('AI响应解析失败:', error);
      throw new Error('响应解析失败');
    }
  }

  // 计算置信度
  calculateConfidence(content, result) {
    // 基于关键词和语言模式计算置信度
    const highConfidenceKeywords = ['明确', '确定', '明显', '清晰'];
    const lowConfidenceKeywords = ['可能', '疑似', '不确定', '难以判断'];
    
    let confidence = 75; // 基础置信度
    
    highConfidenceKeywords.forEach(keyword => {
      if (content.includes(keyword)) confidence += 10;
    });
    
    lowConfidenceKeywords.forEach(keyword => {
      if (content.includes(keyword)) confidence -= 15;
    });

    return Math.min(99, Math.max(50, confidence));
  }

  // 提取摘要
  extractSummary(content) {
    // 提取前200个字符作为摘要
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  // 提取特征
  extractFeatures(content) {
    const features = {
      detectedFeatures: [],
      anomalies: [],
      similarities: []
    };

    // 基于关键词提取特征
    const featureKeywords = {
      detected: ['水印', '齿孔', '纸张', '印刷', '颜色', '纹理'],
      anomalies: ['模糊', '色差', '缺失', '变形', '异常'],
      similarities: ['一致', '匹配', '符合', '标准', '正常']
    };

    featureKeywords.detected.forEach(keyword => {
      if (content.includes(keyword)) {
        features.detectedFeatures.push(keyword);
      }
    });

    featureKeywords.anomalies.forEach(keyword => {
      if (content.includes(keyword)) {
        features.anomalies.push(keyword);
      }
    });

    featureKeywords.similarities.forEach(keyword => {
      if (content.includes(keyword)) {
        features.similarities.push(keyword);
      }
    });

    return features;
  }
}

module.exports = new WenxinService();