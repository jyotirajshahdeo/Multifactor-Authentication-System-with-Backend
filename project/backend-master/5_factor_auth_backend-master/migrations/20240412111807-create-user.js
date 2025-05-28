"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        validate: {
          len: [5, 100],
        },
      },
      pin: {
        type: Sequelize.STRING,
        validate: {
          isPin(value) {
            if (value && !/^[0-9]{4}$/.test(value)) {
              throw new Error("PIN must be exactly 4 digits");
            }
          },
        },
      },
      colorSelection: {
        type: Sequelize.TEXT,
        validate: {
          isString(value) {
            if (value && typeof value !== 'string') {
              throw new Error('colorSelection must be a string');
            }
          }
        },
      },
      gesturePattern: {
        type: Sequelize.TEXT, // Stores encrypted string
        allowNull: true,
        validate: {
          isString(value) {
            if (value && typeof value !== 'string') {
              throw new Error('gesturePattern must be a string');
            }
          }
        },
      },
      authMethod: {
        type: Sequelize.ENUM(
          "password", "pin", "color", "gesture", "biometric"
        ),
        allowNull: false,
        defaultValue: "password",
      },
      webauthnChallenge: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          notEmpty: true,
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add index for email
    await queryInterface.addIndex("Users", ["email"], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
