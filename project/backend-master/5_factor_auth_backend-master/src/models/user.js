"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const SALT_ROUNDS = 10;
const { AuthFactor } = require("../utils/constants");

// Load encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-secure-encryption-key-32-characters";

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Biometric, {
        foreignKey: "userId",
        as: "biometrics",
      });
    }

    static encryptData(data) {
      if (!data) return null;
      return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    }

    static decryptData(encryptedData) {
      if (!encryptedData) return null;
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted ? JSON.parse(decrypted) : null;
      } catch (error) {
        console.error("Decryption error:", error);
        return null;
      }
    }

    // Verification method that can be used by the repository
    verifyAuthFactor(factorType, factorValue) {
      switch (factorType) {
        case AuthFactor.PASSWORD:
          return bcrypt.compareSync(factorValue, this.password);
        case AuthFactor.PIN:
          return bcrypt.compareSync(factorValue, this.pin);
        case AuthFactor.COLOR:
          return JSON.stringify(factorValue) === JSON.stringify(this.colorSelection);
        case AuthFactor.GESTURE:
          return JSON.stringify(factorValue) === JSON.stringify(this.gesturePattern);
        case AuthFactor.BIOMETRIC:
          return true; // Biometric verification would be handled separately
        default:
          return false;
      }
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Please provide a valid email address"
          },
          notEmpty: {
            msg: "Email cannot be empty"
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [5, 100],
            msg: "Password must be between 8 and 100 characters"
          }
        }
      },
      pin: {
        type: DataTypes.STRING,
        validate: {
          isValidPin(value) {
            if (value && !/^[0-9]{4}$/.test(value)) {
              throw new Error("PIN must be exactly 4 digits");
            }
          }
        }
      },
      colorSelection: {
        type: DataTypes.TEXT,
        validate: {
          isValidColors(value) {
            if (value) {
              try {
                const colors = typeof value === 'string' ? User.decryptData(value) : value;
                if (!Array.isArray(colors) || colors.length !== 3) {
                  throw new Error("Exactly 3 colors must be selected");
                }
                const validColors = [
                  "red", "blue", "green", "yellow", "black",
                  "white", "purple", "orange", "pink", "brown"
                ];
                if (!colors.every(color => validColors.includes(color))) {
                  throw new Error("Invalid color selection");
                }
              } catch (e) {
                throw new Error("Invalid color data");
              }
            }
          }
        },
        get() {
          const rawValue = this.getDataValue('colorSelection');
          return rawValue ? User.decryptData(rawValue) : null;
        },
        set(value) {
          this.setDataValue('colorSelection', 
            Array.isArray(value) ? User.encryptData(value) : value
          );
        }
      },
      gesturePattern: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isValidGesture(value) {
            if (value) {
              try {
                const pattern = typeof value === 'string' ? User.decryptData(value) : value;
                if (!Array.isArray(pattern)) {
                  throw new Error("Gesture pattern must be an array");
                }
                if (!pattern.every(num => Number.isInteger(num) && num >= 1 && num <= 9)) {
                  throw new Error("Gesture pattern must contain numbers 1-9");
                }
              } catch (e) {
                throw new Error("Invalid gesture pattern");
              }
            }
          }
        },
        get() {
          const rawValue = this.getDataValue('gesturePattern');
          return rawValue ? User.decryptData(rawValue) : null;
        },
        set(value) {
          this.setDataValue('gesturePattern', 
            Array.isArray(value) ? User.encryptData(value) : value
          );
        }
      },
      authMethod: {
        type: DataTypes.ENUM(
          "password", "pin", "color", "gesture", "biometric"
        ),
        allowNull: false,
        defaultValue: "password",
        validate: {
          isValidMethod(value) {
            if (![
              "password", "pin", "color", "gesture", "biometric"
            ].includes(value)) {
              throw new Error("Invalid authentication method");
            }
          }
        }
      },
      webauthnChallenge: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "WebAuthn challenge cannot be empty if provided"
          }
        }
      }
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
          }
          if (user.pin) {
            user.pin = await bcrypt.hash(user.pin, SALT_ROUNDS);
          }
          // Handle cases where values might come in unencrypted
          if (user.colorSelection && Array.isArray(user.colorSelection)) {
            user.colorSelection = User.encryptData(user.colorSelection);
          }
          if (user.gesturePattern && Array.isArray(user.gesturePattern)) {
            user.gesturePattern = User.encryptData(user.gesturePattern);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password") && user.password) {
            user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
          }
          if (user.changed("pin") && user.pin) {
            user.pin = await bcrypt.hash(user.pin, SALT_ROUNDS);
          }
          if (user.changed("colorSelection") && Array.isArray(user.colorSelection)) {
            user.colorSelection = User.encryptData(user.colorSelection);
          }
          if (user.changed("gesturePattern") && Array.isArray(user.gesturePattern)) {
            user.gesturePattern = User.encryptData(user.gesturePattern);
          }
        }
      },
      defaultScope: {
        attributes: {
          exclude: ['password', 'pin', 'webauthnChallenge']
        }
      },
      scopes: {
        withSensitiveData: {
          attributes: { include: ['password', 'pin', 'webauthnChallenge'] }
        }
      }
    }
  );

  return User;
};
