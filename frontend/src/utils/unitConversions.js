// Unit conversion utilities for waste quantities

/**
 * Convert any unit to tons for pricing calculations
 * @param {number} amount - The quantity amount
 * @param {string} unit - The unit (kg, quintals, tons)
 * @returns {number} - Amount converted to tons
 */
export const convertToTons = (amount, unit) => {
  const numAmount = parseFloat(amount) || 0;
  
  switch (unit?.toLowerCase()) {
    case 'kg':
    case 'kilograms':
      return numAmount / 1000; // 1000 kg = 1 ton
    case 'quintals':
    case 'quintal':
      return numAmount / 10; // 10 quintals = 1 ton
    case 'tons':
    case 'ton':
    default:
      return numAmount;
  }
};

/**
 * Convert tons to any unit for display
 * @param {number} tons - Amount in tons
 * @param {string} targetUnit - Target unit (kg, quintals, tons)
 * @returns {number} - Amount in target unit
 */
export const convertFromTons = (tons, targetUnit) => {
  const numTons = parseFloat(tons) || 0;
  
  switch (targetUnit?.toLowerCase()) {
    case 'kg':
    case 'kilograms':
      return numTons * 1000; // 1 ton = 1000 kg
    case 'quintals':
    case 'quintal':
      return numTons * 10; // 1 ton = 10 quintals
    case 'tons':
    case 'ton':
    default:
      return numTons;
  }
};

/**
 * Get available units for waste listings
 * @returns {Array} - Array of unit options
 */
export const getAvailableUnits = () => [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'quintals', label: 'Quintals' },
  { value: 'tons', label: 'Tons' }
];

/**
 * Calculate price based on quantity and unit, always using tons for pricing
 * @param {number} amount - Quantity amount
 * @param {string} unit - Quantity unit
 * @param {number} pricePerTon - Price per ton
 * @returns {number} - Total price
 */
export const calculatePrice = (amount, unit, pricePerTon) => {
  const amountInTons = convertToTons(amount, unit);
  return amountInTons * parseFloat(pricePerTon || 0);
};

/**
 * Format unit display for UI
 * @param {string} unit - Unit value
 * @returns {string} - Formatted unit label
 */
export const formatUnit = (unit) => {
  switch (unit?.toLowerCase()) {
    case 'kg':
      return 'kg';
    case 'quintals':
      return 'quintals';
    case 'tons':
      return 'tons';
    default:
      return unit || 'units';
  }
};

/**
 * Get unit conversion info for display
 * @param {string} unit - Unit value
 * @returns {object} - Conversion info
 */
export const getUnitConversionInfo = (unit) => {
  switch (unit?.toLowerCase()) {
    case 'kg':
      return {
        label: 'Kilograms',
        shortLabel: 'kg',
        conversionToTons: '1000 kg = 1 ton',
        conversionFactor: 1000
      };
    case 'quintals':
      return {
        label: 'Quintals',
        shortLabel: 'quintals',
        conversionToTons: '10 quintals = 1 ton',
        conversionFactor: 10
      };
    case 'tons':
      return {
        label: 'Tons',
        shortLabel: 'tons',
        conversionToTons: '1 ton = 1 ton',
        conversionFactor: 1
      };
    default:
      return {
        label: 'Units',
        shortLabel: 'units',
        conversionToTons: 'Unknown conversion',
        conversionFactor: 1
      };
  }
};