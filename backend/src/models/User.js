module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-()]+$/
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'expert'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // 软删除
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['status']
      },
      {
        fields: ['role']
      }
    ]
  });

  User.associate = function(models) {
    // 用户关联收藏
    User.hasMany(models.Collection, {
      foreignKey: 'userId',
      as: 'collections'
    });

    // 用户关联鉴定记录
    User.hasMany(models.Authentication, {
      foreignKey: 'userId',
      as: 'authentications'
    });

    // 用户关联帖子
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });

    // 用户关联评论
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // 用户喜欢的邮票（多对多）
    User.belongsToMany(models.Stamp, {
      through: 'UserLikes',
      foreignKey: 'userId',
      otherKey: 'stampId',
      as: 'likedStamps'
    });
  };

  // 实例方法
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};