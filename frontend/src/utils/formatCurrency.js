/**
 * Formats a given amount into the specified currency.
 * 
 * @param {number} amount - The numeric amount to format.
 * @param {string} currency - The currency code (e.g., 'USD', 'INR').
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null) return 'N/A';

    // We can assume an exchange rate if we wanted, but for UI representation,
    // if the backend sends USD, we might want to convert it.
    // For now, assuming backend sends raw number and we just apply standard formatting/conversion.
    // Let's use a mock conversion rate if the base is USD or INR.
    // Assumption: Backend stores prices in INR or USD? Let's say it stores in INR, or we just format the raw number.
    // The prompt implies we have a global currency toggle. We should probably apply a static exchange rate for UI purposes if converting.
    // Let's use 1 USD = 83 INR. To convert from INR to USD, divide by 83.
    // If we assume the db price is in INR (default):
    let displayAmount = amount;

    // Simple conversion logic for UI display. Assuming base is INR (default currency).
    if (currency === 'USD') {
        displayAmount = amount / 83.0; // Mock conversion rate
    }

    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
    }).format(displayAmount);
};
