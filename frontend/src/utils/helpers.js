/**
 * Format currency value to Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format number with Indian number system (lakhs, crores)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format date to readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time to readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Get status color class
 * @param {string} status - Status string
 * @returns {string} CSS class for status color
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
    case 'confirmed':
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'paid':
    case 'payment_completed':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
    case 'in_transit':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Get waste type color class
 * @param {string} wasteType - Waste type
 * @returns {string} CSS class for waste type color
 */
export const getWasteTypeColor = (wasteType) => {
  switch (wasteType?.toLowerCase()) {
    case 'organic':
      return 'bg-green-100 text-green-800';
    case 'plastic':
      return 'bg-blue-100 text-blue-800';
    case 'metal':
      return 'bg-gray-100 text-gray-800';
    case 'paper':
      return 'bg-yellow-100 text-yellow-800';
    case 'glass':
      return 'bg-cyan-100 text-cyan-800';
    case 'electronic':
      return 'bg-purple-100 text-purple-800';
    case 'textile':
      return 'bg-pink-100 text-pink-800';
    case 'hazardous':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get waste type label
 * @param {string} wasteType - Waste type
 * @returns {string} Formatted waste type label
 */
export const getWasteTypeLabel = (wasteType) => {
  if (!wasteType) return 'Unknown';
  return wasteType.charAt(0).toUpperCase() + wasteType.slice(1);
};

/**
 * Get quality grade color class
 * @param {string} grade - Quality grade
 * @returns {string} CSS class for quality grade color
 */
export const getQualityGradeColor = (grade) => {
  switch (grade?.toLowerCase()) {
    case 'a':
    case 'excellent':
      return 'bg-green-100 text-green-800';
    case 'b':
    case 'good':
      return 'bg-blue-100 text-blue-800';
    case 'c':
    case 'fair':
      return 'bg-yellow-100 text-yellow-800';
    case 'd':
    case 'poor':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get waste status color class
 * @param {string} status - Waste status
 * @returns {string} CSS class for waste status color
 */
export const getWasteStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800';
    case 'sold':
      return 'bg-blue-100 text-blue-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get waste status label
 * @param {string} status - Waste status
 * @returns {string} Formatted waste status label
 */
export const getWasteStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Get order status color class (alias for getStatusColor)
 * @param {string} status - Order status
 * @returns {string} CSS class for order status color
 */
export const getOrderStatusColor = (status) => {
  return getStatusColor(status);
};

/**
 * Get order status label
 * @param {string} status - Order status
 * @returns {string} Formatted order status label
 */
export const getOrderStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

/**
 * Convert weight to tons
 * @param {number} amount - Amount
 * @param {string} unit - Unit (kg, tons, etc.)
 * @returns {number} Amount in tons
 */
export const convertToTons = (amount, unit) => {
  if (!amount || !unit) return 0;
  
  switch (unit.toLowerCase()) {
    case 'kg':
    case 'kilograms':
      return amount / 1000;
    case 'tons':
    case 'tonnes':
      return amount;
    case 'g':
    case 'grams':
      return amount / 1000000;
    default:
      return amount;
  }
};

/**
 * Recommend vehicle based on quantity
 * @param {number} quantityTons - Quantity in tons
 * @returns {string} Recommended vehicle type
 */
export const recommendVehicle = (quantityTons) => {
  if (quantityTons <= 2) return 'mini';
  if (quantityTons <= 5) return 'small';
  if (quantityTons <= 10) return 'medium';
  if (quantityTons <= 20) return 'large';
  return 'extra_large';
};

/**
 * Get vehicle types
 * @returns {Array} Array of vehicle types
 */
export const getVehicleTypes = () => {
  return [
    { id: 'mini', name: 'Mini Truck', capacity: 2 },
    { id: 'small', name: 'Small Truck', capacity: 5 },
    { id: 'medium', name: 'Medium Truck', capacity: 10 },
    { id: 'large', name: 'Large Truck', capacity: 20 },
    { id: 'extra_large', name: 'Extra Large Truck', capacity: 30 }
  ];
};

/**
 * Check if vehicle is suitable for quantity
 * @param {Object} vehicle - Vehicle object
 * @param {number} quantityTons - Quantity in tons
 * @returns {boolean} Is vehicle suitable
 */
export const isVehicleSuitable = (vehicle, quantityTons) => {
  return vehicle.capacity >= quantityTons;
};