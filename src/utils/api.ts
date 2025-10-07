import { BloodPressureReading } from '../types';

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
};
