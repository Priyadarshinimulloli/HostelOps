const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  category: {
    type: DataTypes.ENUM('Electrical', 'Plumbing', 'Cleaning', 'Other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000],
    },
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
});

// Define associations
User.hasMany(Complaint, { foreignKey: 'userId', onDelete: 'CASCADE' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

module.exports = Complaint;
