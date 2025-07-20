import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageInitializer from './storageInit';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username',
  UNIQUE_ID: 'UniqueID',
  USER_ROLE: 'userRole',
  IS_LOGGED_IN: 'isLoggedIn',
};

// Safe storage operations with error handling
class SafeStorage {
  static async getItem(key, defaultValue = null) {
    try {
      await StorageInitializer.waitForInitialization();
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.warn(`Failed to get item ${key}:`, error);
      return defaultValue;
    }
  }

  static async setItem(key, value) {
    try {
      await StorageInitializer.waitForInitialization();
      await AsyncStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  static async removeItem(key) {
    try {
      await StorageInitializer.waitForInitialization();
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  static async clear() {
    try {
      await StorageInitializer.waitForInitialization();
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      return false;
    }
  }

  static async multiGet(keys) {
    try {
      await StorageInitializer.waitForInitialization();
      const values = await AsyncStorage.multiGet(keys);
      return values;
    } catch (error) {
      console.warn('Failed to multiGet:', error);
      return keys.map(key => [key, null]);
    }
  }

  static async multiSet(keyValuePairs) {
    try {
      await StorageInitializer.waitForInitialization();
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      console.warn('Failed to multiSet:', error);
      return false;
    }
  }

  // User-specific storage methods
  static async saveUserData(userData) {
    const { token, user } = userData;
    const keyValuePairs = [
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.USERNAME, user.name],
      [STORAGE_KEYS.UNIQUE_ID, user._id],
      [STORAGE_KEYS.USER_ROLE, user.role],
      [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
    ];
    
    return await this.multiSet(keyValuePairs);
  }

  static async getUserData() {
    const keys = [
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USERNAME,
      STORAGE_KEYS.UNIQUE_ID,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.IS_LOGGED_IN,
    ];
    
    const values = await this.multiGet(keys);
    const data = {};
    
    values.forEach(([key, value]) => {
      data[key] = value;
    });
    
    return data;
  }

  static async clearUserData() {
    const keys = Object.values(STORAGE_KEYS);
    const removePromises = keys.map(key => this.removeItem(key));
    
    try {
      await Promise.all(removePromises);
      return true;
    } catch (error) {
      console.warn('Failed to clear user data:', error);
      return false;
    }
  }

  static async isLoggedIn() {
    const isLoggedIn = await this.getItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    const token = await this.getItem(STORAGE_KEYS.TOKEN);
    return isLoggedIn === 'true' && token !== null;
  }

  static async getToken() {
    return await this.getItem(STORAGE_KEYS.TOKEN);
  }

  static async getUsername() {
    return await this.getItem(STORAGE_KEYS.USERNAME);
  }

  static async getUniqueId() {
    return await this.getItem(STORAGE_KEYS.UNIQUE_ID);
  }

  static async getUserRole() {
    return await this.getItem(STORAGE_KEYS.USER_ROLE);
  }
}

export default SafeStorage; 