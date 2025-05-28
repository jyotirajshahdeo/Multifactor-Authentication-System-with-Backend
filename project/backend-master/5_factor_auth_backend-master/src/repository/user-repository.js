"use strict";
const { User } = require("../models/index");
const bcrypt = require("bcryptjs");
const { AuthFactor } = require("../utils/constants");

class UserRepository {
  async create(data) {
    try {
      const user = await User.create(data);
      return user;
    } catch (error) {
      console.log("Something wrong at repository layer");
      throw error;
    }
  }

  async getByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      console.log("Something wrong at repository layer");
      throw error;
    }
  }

  async getById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: {
          include: ["password", "pin"],
        },
      });
      return user;
    } catch (error) {
      console.log("Something wrong at repository layer");
      throw error;
    }
  }

  async verifyPassword(email, password) {
    try {
      const user = await this.getByEmail(email);
      if (!user) return false;
      return bcrypt.compareSync(password, user.password);
    } catch (error) {
      console.log("Something wrong at repository layer");
      throw error;
    }
  }

  async verifyAuthFactor(userId, factorType, factorValue) {
    try {
      const user = await this.getById(userId);
      if (!user) return false;

      console.log("user.colorSelection", user.colorSelection)

      switch (factorType) {
        case AuthFactor.PASSWORD:
          return bcrypt.compareSync(factorValue, user.password);
        case AuthFactor.PIN:
          return bcrypt.compareSync(factorValue, user.pin);
        case AuthFactor.COLOR: {
          return (
            JSON.stringify(factorValue) === JSON.stringify(user.colorSelection)
          );
        }
        case AuthFactor.GESTURE: {
          const decryptedGesture = (user.gesturePattern);
          if (factorValue.length !== decryptedGesture.length) return false;
          return factorValue.every((num, i) => num === decryptedGesture[i]);
        }

        default:
          return false;
      }
    } catch (error) {
      console.log("Error in verifyAuthFactor:", error);
      throw error;
    }
  }

  async updateAuthMethod(userId, method) {
    try {
      const user = await this.getById(userId);
      if (!user) throw new Error("User not found");

      user.authMethod = method;
      await user.save();
      return user;
    } catch (error) {
      console.log("Something wrong at repository layer");
      throw error;
    }
  }

  async storeWebAuthnChallenge(userId, challenge) {
    try {
      const user = await User.findByPk(userId, {
        attributes: {
           include: ["webauthnChallenge"]
        }
      });
      if (!user) throw new Error("User not found");

      user.webauthnChallenge = challenge;
      await user.save();
      return user;
    } catch (error) {
      console.error("Error storing WebAuthn challenge:", error);
      throw error;
    }
  }

  async getWebAuthnChallenge(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes : {
          include : ["webauthnChallenge"]
        }
      });
      if (!user) throw new Error("User not found");
      return user.webauthnChallenge;
    } catch (error) {
      console.error("Error getting WebAuthn challenge:", error);
      throw error;
    }
  }

  async clearWebAuthnChallenge(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error("User not found");

      user.webauthnChallenge = null;
      await user.save();
      return user;
    } catch (error) {
      console.error("Error clearing WebAuthn challenge:", error);
      throw error;
    }
  }
}

module.exports = UserRepository;
