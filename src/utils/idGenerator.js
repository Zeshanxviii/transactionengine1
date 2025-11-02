// utils/idGenerator.js

/**
 * Generate unique IDs for different entities
 * @param {string} prefix - Prefix for the ID (e.g., 'TXN', 'WLT', 'USR')
 * @returns {string} - Generated unique ID
 */
export function generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}${randomPart}`;
  }
  
  /**
   * Generate numeric ID
   * @param {number} length - Length of the numeric ID
   * @returns {string} - Generated numeric ID
   */
export function generateNumericId(length = 10) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }
  
  /**
   * Generate transaction reference number
   * @returns {string} - Transaction reference
   */
export function generateTransactionRef() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXN${dateStr}${timeStr}${random}`;
  }
 