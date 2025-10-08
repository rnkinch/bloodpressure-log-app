import { BloodPressureReading, CigarEntry, DrinkEntry } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  // Get all readings
  getReadings: async (): Promise<BloodPressureReading[]> => {
    const response = await fetch(`${API_BASE_URL}/api/readings`);
    if (!response.ok) {
      throw new Error('Failed to fetch readings');
    }
    return response.json();
  },

  // Add a new reading
  addReading: async (reading: Omit<BloodPressureReading, 'id'>): Promise<BloodPressureReading> => {
    const response = await fetch(`${API_BASE_URL}/api/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      throw new Error('Failed to add reading');
    }
    return response.json();
  },

  // Update a reading
  updateReading: async (id: string, reading: Partial<BloodPressureReading>): Promise<BloodPressureReading> => {
    const response = await fetch(`${API_BASE_URL}/api/readings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      throw new Error('Failed to update reading');
    }
    return response.json();
  },

  // Delete a reading
  deleteReading: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/readings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete reading');
    }
  },

  // Cigar entries
  getCigarEntries: async (): Promise<CigarEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/api/cigars`);
    if (!response.ok) {
      throw new Error('Failed to fetch cigar entries');
    }
    return response.json();
  },

  addCigarEntry: async (entry: Omit<CigarEntry, 'id'>): Promise<CigarEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/cigars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to add cigar entry');
    }
    return response.json();
  },

  updateCigarEntry: async (id: string, entry: Partial<CigarEntry>): Promise<CigarEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/cigars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to update cigar entry');
    }
    return response.json();
  },

  deleteCigarEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/cigars/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete cigar entry');
    }
  },

  // Drink entries
  getDrinkEntries: async (): Promise<DrinkEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/api/drinks`);
    if (!response.ok) {
      throw new Error('Failed to fetch drink entries');
    }
    return response.json();
  },

  addDrinkEntry: async (entry: Omit<DrinkEntry, 'id'>): Promise<DrinkEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/drinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to add drink entry');
    }
    return response.json();
  },

  updateDrinkEntry: async (id: string, entry: Partial<DrinkEntry>): Promise<DrinkEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/drinks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to update drink entry');
    }
    return response.json();
  },

  deleteDrinkEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/drinks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete drink entry');
    }
  },
};
