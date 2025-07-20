import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage initialization utility
class StorageInitializer {
  static isInitialized = false;
  static initPromise = null;

  static async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._performInitialization();
    return this.initPromise;
  }

  static async _performInitialization() {
    try {
      // Test AsyncStorage by writing and reading a test value
      const testKey = '__storage_test__';
      const testValue = 'test_value_' + Date.now();
      
      // Write test value
      await AsyncStorage.setItem(testKey, testValue);
      
      // Read test value
      const readValue = await AsyncStorage.getItem(testKey);
      
      // Clean up test value
      await AsyncStorage.removeItem(testKey);
      
      // Verify the test worked
      if (readValue !== testValue) {
        throw new Error('AsyncStorage read/write test failed');
      }
      
      this.isInitialized = true;
      console.log('AsyncStorage initialized successfully');
      return true;
    } catch (error) {
      console.error('AsyncStorage initialization failed:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  static async waitForInitialization() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return true;
  }

  static reset() {
    this.isInitialized = false;
    this.initPromise = null;
  }
}

export default StorageInitializer; 