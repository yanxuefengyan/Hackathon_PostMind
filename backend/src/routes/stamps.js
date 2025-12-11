const express = require('express');
const { Stamp, Collection, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// 获取邮票列表
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      country, 
      rarity,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    const whereClause = { status: 'active' };
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { code: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) whereClause.category = category;
    if (country) whereClause.country = country;
    if (rarity) whereClause.rarity = rarity;

    const { count, rows: stamps } = await Stamp.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      message: '获取邮票列表成功',
      stamps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('获取邮票列表错误:', error);
    res.status(500).json({ error: '获取邮票列表失败' });
  }
});

// 获取邮票详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const stamp = await Stamp.findOne({
      where: { id, status: 'active' },
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Collection,
          as: 'collections',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    });

    if (!stamp) {
      return res.status(404).json({ error: '邮票不存在' });
    }

    res.json({
      message: '获取邮票详情成功',
      stamp
    });

  } catch (error) {
    console.error('获取邮票详情错误:', error);
    res.status(500).json({ error: '获取邮票详情失败' });
  }
});

// 创建邮票（管理员功能）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      category,
      country,
      issueDate,
      designer,
      printer,
      denomination,
      currency,
      size,
      perforation,
      color,
      quantity,
      rarity,
      images,
      history,
      marketValue,
      marketCurrency,
      tags
    } = req.body;

    // 检查邮票代码是否已存在
    const existingStamp = await Stamp.findOne({ where: { code } });
    if (existingStamp) {
      return res.status(400).json({ error: '邮票代码已存在' });
    }

    const stamp = await Stamp.create({
      name,
      code,
      description,
      category,
      country: country || '中国',
      issueDate,
      designer,
      printer,
      denomination,
      currency: currency || 'CNY',
      size,
      perforation,
      color,
      quantity,
      rarity: rarity || 'common',
      images: images || [],
      history,
      marketValue,
      marketCurrency: marketCurrency || 'CNY',
      tags: tags || [],
      verifiedBy: req.user.userId,
      verified: true,
      lastUpdated: new Date()
    });

    res.status(201).json({
      message: '邮票创建成功',
      stamp
    });

  } catch (error) {
    console.error('创建邮票错误:', error);
    res.status(500).json({ error: '创建邮票失败' });
  }
});

// 更新邮票信息（管理员功能）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const stamp = await Stamp.findByPk(id);
    if (!stamp) {
      return res.status(404).json({ error: '邮票不存在' });
    }

    await stamp.update({
      ...updateData,
      lastUpdated: new Date()
    });

    res.json({
      message: '邮票信息更新成功',
      stamp
    });

  } catch (error) {
    console.error('更新邮票信息错误:', error);
    res.status(500).json({ error: '更新邮票信息失败' });
  }
});

// 删除邮票（管理员功能）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const stamp = await Stamp.findByPk(id);
    if (!stamp) {
      return res.status(404).json({ error: '邮票不存在' });
    }

    await stamp.update({ status: 'deleted' });

    res.json({
      message: '邮票删除成功'
    });

  } catch (error) {
    console.error('删除邮票错误:', error);
    res.status(500).json({ error: '删除邮票失败' });
  }
});

// 获取邮票分类
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { value: '普通邮票', label: '普通邮票' },
      { value: '纪念邮票', label: '纪念邮票' },
      { value: '特种邮票', label: '特种邮票' },
      { value: '欠资邮票', label: '欠资邮票' },
      { value: '航空邮票', label: '航空邮票' },
      { value: '军用邮票', label: '军用邮票' },
      { value: '慈善邮票', label: '慈善邮票' }
    ];

    res.json({
      message: '获取邮票分类成功',
      categories
    });

  } catch (error) {
    console.error('获取邮票分类错误:', error);
    res.status(500).json({ error: '获取邮票分类失败' });
  }
});

module.exports = router;