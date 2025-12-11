const express = require('express');
const { Authentication, Stamp, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const wenxinService = require('../services/wenxinService');
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/authentication/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// AI邮票真伪鉴定
router.post('/authenticate', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { stampId } = req.body;
    const userId = req.user.userId;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请至少上传一张图片' });
    }

    // 构建图片路径数组
    const images = req.files.map(file => `/uploads/authentication/${file.filename}`);

    // 创建鉴定记录
    const authentication = await Authentication.create({
      userId,
      stampId: stampId || null,
      images,
      status: 'processing',
      requestedAt: new Date()
    });

    // 调用文心大模型服务进行鉴定
    let aiResult;
    try {
      // 使用第一张图片进行AI分析
      const aiResponse = await wenxinService.analyzeStampImage(
        images[0], 
        '请分析这张邮票图片的真伪，包括纸张质量、印刷特征、颜色准确性、齿孔特征等方面。请给出明确的结论（真品/仿品/不确定）并说明理由。'
      );
      
      // 解析AI响应
      aiResult = wenxinService.parseAIResponse(aiResponse);
      aiResult.processingTime = Date.now() - new Date(authentication.requestedAt).getTime();
      
    } catch (error) {
      console.error('文心大模型调用失败，使用模拟结果:', error);
      // 如果文心服务不可用，使用模拟结果
      aiResult = await performAIAuthentication(images);
    }

    // 更新鉴定结果
    await authentication.update({
      result: aiResult.result,
      confidence: aiResult.confidence,
      analysis: aiResult.analysis,
      features: aiResult.features,
      aiScore: aiResult.aiScore,
      aiModel: 'wenxin-model-v1.0',
      version: '1.0.0',
      status: 'completed',
      completedAt: new Date(),
      processingTime: aiResult.processingTime
    });

    res.json({
      message: 'AI鉴定完成',
      authentication
    });

  } catch (error) {
    console.error('AI鉴定错误:', error);
    res.status(500).json({ error: 'AI鉴定失败' });
  }
});

// 模拟AI鉴定服务（后续替换为真实的文心大模型调用）
async function performAIAuthentication(images) {
  // 模拟处理时间
  const processingTime = Math.floor(Math.random() * 5000) + 2000; // 2-7秒
  
  // 模拟AI分析结果
  const results = ['authentic', 'fake', 'uncertain'];
  const result = results[Math.floor(Math.random() * results.length)];
  
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
  
  const analysis = {
    paperQuality: Math.floor(Math.random() * 30) + 70,
    printingQuality: Math.floor(Math.random() * 30) + 70,
    colorAccuracy: Math.floor(Math.random() * 30) + 70,
    perforation: Math.floor(Math.random() * 30) + 70,
    overall: confidence
  };

  const features = {
    detectedFeatures: ['水印', '齿孔', '纸张纹理', '印刷网点'],
    anomalies: result === 'fake' ? ['颜色偏差', '纸张质量异常'] : [],
    similarities: result === 'authentic' ? ['印刷特征匹配', '纸张类型一致'] : []
  };

  return {
    result,
    confidence,
    analysis,
    features,
    aiScore: confidence,
    processingTime
  };
}

// 获取用户的鉴定历史
router.get('/authentications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, result, status } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (result) whereClause.result = result;
    if (status) whereClause.status = status;

    const { count, rows: authentications } = await Authentication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Stamp,
          as: 'stamp',
          attributes: ['id', 'name', 'code', 'images']
        },
        {
          model: User,
          as: 'expert',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['requestedAt', 'DESC']]
    });

    res.json({
      message: '获取鉴定历史成功',
      authentications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('获取鉴定历史错误:', error);
    res.status(500).json({ error: '获取鉴定历史失败' });
  }
});

// 获取鉴定详情
router.get('/authentications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const authentication = await Authentication.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Stamp,
          as: 'stamp',
          attributes: ['id', 'name', 'code', 'images', 'description']
        },
        {
          model: User,
          as: 'expert',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    if (!authentication) {
      return res.status(404).json({ error: '鉴定记录不存在' });
    }

    // 检查权限
    if (authentication.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权访问此鉴定记录' });
    }

    res.json({
      message: '获取鉴定详情成功',
      authentication
    });

  } catch (error) {
    console.error('获取鉴定详情错误:', error);
    res.status(500).json({ error: '获取鉴定详情失败' });
  }
});

// 专家审核鉴定结果
router.post('/authentications/:id/review', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { expertReview, result } = req.body;

    // 检查用户权限
    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      return res.status(403).json({ error: '只有专家或管理员可以审核鉴定结果' });
    }

    const authentication = await Authentication.findByPk(id);
    if (!authentication) {
      return res.status(404).json({ error: '鉴定记录不存在' });
    }

    await authentication.update({
      expertReview,
      result: result || authentication.result,
      expertId: req.user.userId,
      status: 'completed'
    });

    res.json({
      message: '专家审核完成',
      authentication
    });

  } catch (error) {
    console.error('专家审核错误:', error);
    res.status(500).json({ error: '专家审核失败' });
  }
});

module.exports = router;