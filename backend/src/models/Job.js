const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Job extends Model {}

Job.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  externalId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.FLOAT
  },
  longitude: {
    type: DataTypes.FLOAT
  },
  jobType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Contract-to-hire'),
    defaultValue: 'Full-time'
  },
  remote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  salary: {
    type: DataTypes.STRING
  },
  experienceLevel: {
    type: DataTypes.ENUM('Entry', 'Junior', 'Mid-level', 'Senior', 'Executive'),
    defaultValue: 'Mid-level'
  },
  yearsRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  requiredSkills: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  applyUrl: {
    type: DataTypes.STRING
  },
  postedDate: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Job',
  timestamps: true
});

module.exports = Job;