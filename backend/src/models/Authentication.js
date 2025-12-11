module.exports = (sequelize, DataTypes) => {
  const Authentication = sequelize.define('Authentication', {
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
      allowNull: true,
      references: {
        model: 'stamps',
        key: 'id'
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    result: {
      type: DataTypes.ENUM('authentic', 'fake', 'uncertain'),
      allowNull: false
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    analysis: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    aiScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    expertReview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expertId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '处理时间（毫秒）'
    },
    aiModel: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'authentications',
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
        fields: ['result']
      },
      {
        fields: ['status']
      },
      {
        fields: ['requestedAt']
      }
    ]
  });

  Authentication.associate = function(models) {
    // 鉴定关联用户
    Authentication.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // 鉴定关联专家
    Authentication.belongsTo(models.User, {
      foreignKey: 'expertId',
      as: 'expert'
    });

    // 鉴定关联邮票
    Authentication.belongsTo(models.Stamp, {
      foreignKey: 'stampId',
      as: 'stamp'
    });
  };

  return Authentication;
};