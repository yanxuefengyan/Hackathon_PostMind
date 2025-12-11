module.exports = (sequelize, DataTypes) => {
  const Stamp = sequelize.define('Stamp', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
        notEmpty: true
      }
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isIn: [['普通邮票', '纪念邮票', '特种邮票', '欠资邮票', '航空邮票', '军用邮票', '慈善邮票']]
      }
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '中国'
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    designer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    printer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    denomination: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY'
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    perforation: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    rarity: {
      type: DataTypes.ENUM('common', 'uncommon', 'rare', 'very_rare', 'legendary'),
      defaultValue: 'common'
    },
    condition: {
      type: DataTypes.ENUM('mint', 'used', 'damaged'),
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    marketValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    marketCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY'
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active'
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'stamps',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['category']
      },
      {
        fields: ['country']
      },
      {
        fields: ['rarity']
      },
      {
        fields: ['status']
      }
    ]
  });

  Stamp.associate = function(models) {
    // 邮票关联收藏
    Stamp.hasMany(models.Collection, {
      foreignKey: 'stampId',
      as: 'collections'
    });

    // 邮票关联鉴定记录
    Stamp.hasMany(models.Authentication, {
      foreignKey: 'stampId',
      as: 'authentications'
    });

    // 邮票关联验证者
    Stamp.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });

    // 喜欢邮票的用户（多对多）
    Stamp.belongsToMany(models.User, {
      through: 'UserLikes',
      foreignKey: 'stampId',
      otherKey: 'userId',
      as: 'likers'
    });
  };

  return Stamp;
};