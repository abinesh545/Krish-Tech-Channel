/**
 * LocalStorage utilities for saving calculations history
 */

const STORAGE_KEY = 'krish_tech_calculations';
const MAX_HISTORY = 10;

export function saveCalculation(calc) {
  try {
    const history = getCalculations();
    const newCalc = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...calc
    };
    
    // Put newest first and keep up to MAX_HISTORY items
    const updatedHistory = [newCalc, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error saving calculation to localStorage:', error);
    return [];
  }
}

export function getCalculations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading calculations from localStorage:', error);
    return [];
  }
}

export function deleteCalculation(id) {
  try {
    const history = getCalculations();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing history:', error);
    return [];
  }
}
