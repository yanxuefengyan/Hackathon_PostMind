const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建Sequelize实例
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://postmind:postmind123@localhost:5432/postmind',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 导入模型
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Stamp = require('./Stamp')(sequelize, Sequelize.DataTypes);
const Collection = require('./Collection')(sequelize, Sequelize.DataTypes);
const Authentication = require('./Authentication')(sequelize, Sequelize.DataTypes);
const Post = require('./Post')(sequelize, Sequelize.DataTypes);
const Comment = require('./Comment')(sequelize, Sequelize.DataTypes);

// 定义模型关联
const models = {
  User,
  Stamp,
  Collection,
  Authentication,
  Post,
  Comment
};

// 设置模型关联
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步数据库模型
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ 数据库模型同步完成');
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  ...models
};