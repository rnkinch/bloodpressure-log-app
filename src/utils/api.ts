import { BloodPressureReading, CigarEntry, DrinkEntry, WeightEntry } from '../types';

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

  // Weight entries
  getWeightEntries: async (): Promise<WeightEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/api/weights`);
    if (!response.ok) {
      throw new Error('Failed to fetch weight entries');
    }
    return response.json();
  },

  addWeightEntry: async (entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/weights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to add weight entry');
    }
    return response.json();
  },

  updateWeightEntry: async (id: string, entry: Partial<WeightEntry>): Promise<WeightEntry> => {
    const response = await fetch(`${API_BASE_URL}/api/weights/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to update weight entry');
    }
    return response.json();
  },

  deleteWeightEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/weights/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete weight entry');
    }
  },

  // AI Analysis
  getAdvancedAnalysis: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/analysis/advanced`);
    if (!response.ok) {
      throw new Error('Failed to fetch advanced AI analysis');
    }
    return response.json();
  },

  checkAIServiceHealth: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/analysis/health`);
    if (!response.ok) {
      throw new Error('AI service health check failed');
    }
    return response.json();
  },

  // Settings
  getSetting: async (key: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/settings/${key}`);
    if (!response.ok) {
      throw new Error('Failed to fetch setting');
    }
    return response.json();
  },

  setSetting: async (key: string, value: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) {
      throw new Error('Failed to save setting');
    }
    return response.json();
  },
};
