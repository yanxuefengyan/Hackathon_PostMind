module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
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
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10
      }
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'hidden', 'deleted'),
      defaultValue: 'active'
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['postId']
      },
      {
        fields: ['parentId']
      },
      {
        fields: ['level']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  Comment.associate = function(models) {
    // 评论关联用户
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // 评论关联帖子
    Comment.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post'
    });

    // 评论关联父评论
    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // 评论关联子评论
    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies'
    });

    // 评论关联点赞的用户（多对多）
    Comment.belongsToMany(models.User, {
      through: 'CommentLikes',
      foreignKey: 'commentId',
      otherKey: 'userId',
      as: 'likers'
    });
  };

  return Comment;
};