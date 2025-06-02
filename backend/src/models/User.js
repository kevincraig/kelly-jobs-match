const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  latitude: {
    type: DataTypes.FLOAT,
  },
  longitude: {
    type: DataTypes.FLOAT,
  },
  role: {
    type: DataTypes.STRING,
  },
  roleCategory: {
    type: DataTypes.STRING,
  },
  roleSubcategory: {
    type: DataTypes.STRING,
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  experience: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  education: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      jobTypes: ['Full-time'],
      remoteWork: false,
      maxRadius: 25,
    },
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;