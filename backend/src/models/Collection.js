module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define('Collection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    stampId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stamps',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    condition: {
      type: DataTypes.ENUM('mint', 'near_mint', 'fine', 'very_good', 'good', 'fair', 'poor'),
      allowNull: false,
      defaultValue: 'fine'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purchaseFrom: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    currentValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    currentCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CNY'
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    isForSale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    salePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'collections',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['stampId']
      },
      {
        fields: ['condition']
      },
      {
        fields: ['isForSale']
      },
      {
        fields: ['isPublic']
      },
      {
        unique: true,
        fields: ['userId', 'stampId']
      }
    ]
  });

  Collection.associate = function(models) {
    // 收藏关联用户
    Collection.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // 收藏关联邮票
    Collection.belongsTo(models.Stamp, {
      foreignKey: 'stampId',
      as: 'stamp'
    });
  };

  return Collection;
};