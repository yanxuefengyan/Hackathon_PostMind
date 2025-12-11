module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('discussion', 'showcase', 'question', 'news', 'tutorial'),
      allowNull: false,
      defaultValue: 'discussion'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'hidden', 'deleted'),
      defaultValue: 'published'
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    comments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['isPinned']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['lastActivityAt']
      }
    ]
  });

  Post.associate = function(models) {
    // 帖子关联用户
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // 帖子关联评论
    Post.hasMany(models.Comment, {
      foreignKey: 'postId',
      as: 'comments'
    });

    // 帖子关联点赞的用户（多对多）
    Post.belongsToMany(models.User, {
      through: 'PostLikes',
      foreignKey: 'postId',
      otherKey: 'userId',
      as: 'likers'
    });
  };

  return Post;
};