"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Biometric extends Model {
    static associate(models) {
      Biometric.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  Biometric.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    credentialID: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credentialPublicKey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    counter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    biometricType: {
      type: DataTypes.ENUM('webauthn', 'fingerprint', 'face', 'iris', 'voice'),
      allowNull: false,
      defaultValue: 'webauthn'
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    transports: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['internal']
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    challenge: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Biometric',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['credentialID'],
        unique: true
      }
    ]
  });

  return Biometric;
};