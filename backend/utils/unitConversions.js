// Unit conversion utilities for waste quantities (Backend)

/**
 * Convert any unit to tons for pricing calculations
 * @param {number} amount - The quantity amount
 * @param {string} unit - The unit (kg, quintals, tons)
 * @returns {number} - Amount converted to tons
 */
const convertToTons = (amount, unit) => {
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
const convertFromTons = (tons, targetUnit) => {
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
 * Calculate price based on quantity and unit, always using tons for pricing
 * @param {number} amount - Quantity amount
 * @param {string} unit - Quantity unit
 * @param {number} pricePerTon - Price per ton
 * @returns {number} - Total price
 */
const calculatePrice = (amount, unit, pricePerTon) => {
  const amountInTons = convertToTons(amount, unit);
  return amountInTons * parseFloat(pricePerTon || 0);
};

/**
 * Validate if requested quantity is available (convert both to same unit for comparison)
 * @param {number} requestedAmount - Requested quantity amount
 * @param {string} requestedUnit - Requested quantity unit
 * @param {number} availableAmount - Available quantity amount
 * @param {string} availableUnit - Available quantity unit
 * @returns {boolean} - Whether the requested quantity is available
 */
const isQuantityAvailable = (requestedAmount, requestedUnit, availableAmount, availableUnit) => {
  const requestedInTons = convertToTons(requestedAmount, requestedUnit);
  const availableInTons = convertToTons(availableAmount, availableUnit);
  return requestedInTons <= availableInTons;
};

module.exports = {
  convertToTons,
  convertFromTons,
  calculatePrice,
  isQuantityAvailable
};