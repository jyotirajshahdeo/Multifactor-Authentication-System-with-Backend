'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create table with all columns
    await queryInterface.createTable('Biometrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      credentialID: {
        type: Sequelize.STRING(1024), // Using STRING with length for MySQL compatibility
        allowNull: true
      },
      credentialPublicKey: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      counter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      biometricType: {
        type: Sequelize.ENUM('webauthn', 'fingerprint', 'face', 'iris', 'voice'),
        allowNull: false,
        defaultValue: 'webauthn'
      },
      deviceInfo: {
        type: Sequelize.JSON,
        allowNull: true
      },
      transports: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ['internal']
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      challenge: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('Biometrics', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_biometrics_user',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Add regular index on userId
    await queryInterface.addIndex('Biometrics', ['userId']);

    // Handle unique index differently per database
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'mysql' || dialect === 'mariadb') {
      // MySQL/MariaDB implementation
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX idx_biometrics_credentialID ON Biometrics (credentialID(255))
      `);
    } else if (dialect === 'postgres' || dialect === 'sqlite') {
      // PostgreSQL/SQLite implementation with NULL filtering
      await queryInterface.addIndex('Biometrics', {
        fields: ['credentialID'],
        unique: true,
        where: {
          credentialID: {
            [Sequelize.Op.ne]: null
          }
        },
        name: 'idx_biometrics_credentialID'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove unique index first
      await queryInterface.removeIndex('Biometrics', 'idx_biometrics_credentialID');
    } catch (error) {
      console.log('Index removal error (might not exist):', error.message);
    }

    try {
      // Remove foreign key constraint
      await queryInterface.removeConstraint('Biometrics', 'fk_biometrics_user');
    } catch (error) {
      console.log('Constraint removal error:', error.message);
    }

    // Finally drop the table
    await queryInterface.dropTable('Biometrics');
  }
};