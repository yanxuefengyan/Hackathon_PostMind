const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Session storage for mobile uploads (in production, use Redis)
const mobileSessions = new Map();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/general/';
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
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片或PDF文件 (JPEG, JPG, PNG, GIF, PDF)'));
    }
  }
});

// 移动端上传接口（无需认证）
router.post('/mobile', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: '缺少会话ID' });
    }

    const fileUrl = `/uploads/general/${req.file.filename}`;
    
    // Store image in session
    if (!mobileSessions.has(sessionId)) {
      mobileSessions.set(sessionId, []);
    }
    
    const sessionImages = mobileSessions.get(sessionId);
    sessionImages.push({
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    });
    
    res.json({
      message: '文件上传成功',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('移动端上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 获取移动端会话图片
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!mobileSessions.has(sessionId)) {
      return res.json({ images: [] });
    }
    
    const sessionImages = mobileSessions.get(sessionId);
    res.json({ 
      images: sessionImages.map(img => img.fileUrl),
      files: sessionImages
    });

  } catch (error) {
    console.error('获取会话图片错误:', error);
    res.status(500).json({ error: '获取会话图片失败' });
  }
});

// 通用文件上传接口
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const fileUrl = `/uploads/general/${req.file.filename}`;
    
    res.json({
      message: '文件上传成功',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 多文件上传接口
router.post('/images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const files = req.files.map(file => ({
      fileUrl: `/uploads/general/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      message: '文件上传成功',
      files,
      count: files.length
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 删除文件接口
router.delete('/file/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/general/', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: '文件删除成功' });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }

  } catch (error) {
    console.error('文件删除错误:', error);
    res.status(500).json({ error: '文件删除失败' });
  }
});

module.exports = router;