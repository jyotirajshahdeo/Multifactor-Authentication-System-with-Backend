"use strict";
const UserRepository = require("../repository/user-repository");
const { AuthFactor } = require("../utils/constants");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async create(data) {
    try {
      const requiredFields = {
        [AuthFactor.PASSWORD]: ['password'],
        [AuthFactor.PIN]: ['pin'],
        [AuthFactor.COLOR]: ['colorSelection'],
        [AuthFactor.GESTURE]: ['gesturePattern'],
        [AuthFactor.BIOMETRIC]: []
      };

      const authMethod = data.authMethod || 'password';
      const fields = requiredFields[authMethod] || [];
      const missing = fields.filter(field => !data[field]);

      if (missing.length > 0) {
        throw new Error(`Missing fields for ${authMethod}: ${missing.join(', ')}`);
      }

      // const user = this.userRepository.getByEmail(data?.email) 

      // if(user) {
      //   throw new Error("User Alredy Exist with the Creadential")
      // }

      return await this.userRepository.create(data);
    } catch (error) {
      throw new Error (`${error}`);
    }
  }

  async signIn(email, factorType, factorValue) {

    console.log("email", email)
    try {
      const user = await this.userRepository.getByEmail(email);
      if (!user) throw new Error('User not found');

      console.log("user", user.id)

      if (factorType !== AuthFactor.BIOMETRIC) {
        const isValid = await this.userRepository.verifyAuthFactor(
          user.id,
          factorType,
          factorValue
        );
        
        if (!isValid) throw new Error('Authentication failed');
        
        return {
          id: user.id,
          email: user.email,
          authMethod: user.authMethod
        };
      }

      throw new Error('Use biometric service for biometric authentication');
    } catch (error) {
      console.error("Auth Failed:", error.message);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.userRepository.getById(userId);
      if (!user) throw new Error('User not found');
      
      return {
        id: user.id,
        email: user.email,
        authMethod: user.authMethod,
        biometrics: user.biometrics
      };
    } catch (error) {
      console.error("Profile Error:", error.message);
      throw error;
    }
  }

  async updateAuthMethod(userId, newMethod) {
    try {
      return await this.userRepository.updateAuthMethod(userId, newMethod);
    } catch (error) {
      console.error("Update Error:", error.message);
      throw error;
    }
  }
}

module.exports = UserService;