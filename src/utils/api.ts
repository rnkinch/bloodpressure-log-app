import { BloodPressureReading, CigarEntry, DrinkEntry, WeightEntry, CardioEntry, EventEntry } from '../types';

const normalizeBaseUrl = (base?: string) => {
  if (base) {
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }
  
  // Auto-detect API URL based on current hostname
  // If accessed via IP (192.x.x.x), use that IP for API
  // Otherwise use localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Check if accessing via IP address (LAN access)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `http://${hostname}:3001`;
    }
  }
  
  // Default to localhost for local development
  return 'http://localhost:3001';
};

const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL);
const buildUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const api = {
  // Get all readings
  getReadings: async (): Promise<BloodPressureReading[]> => {
    const url = buildUrl(`/api/readings`);
    console.log('Fetching readings from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch readings:', response.status, response.statusText);
      throw new Error(`Failed to fetch readings: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Received readings from API:', data.length, 'entries');
    return data;
  },

  // Add a new reading
  addReading: async (reading: Omit<BloodPressureReading, 'id'>): Promise<BloodPressureReading> => {
    const response = await fetch(buildUrl(`/api/readings`), {
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
    const response = await fetch(buildUrl(`/api/readings/${id}`), {
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
    const response = await fetch(buildUrl(`/api/readings/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete reading');
    }
  },

  // Cigar entries
  getCigarEntries: async (): Promise<CigarEntry[]> => {
    const url = buildUrl(`/api/cigars`);
    console.log('Fetching cigars from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('Failed to fetch cigars:', response.status, text.substring(0, 200));
      throw new Error(`Failed to fetch cigar entries: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON. Content-Type:', contentType, 'Response:', text.substring(0, 200));
      throw new Error('Response is not JSON. Check if backend is running.');
    }
    return response.json();
  },

  addCigarEntry: async (entry: Omit<CigarEntry, 'id'>): Promise<CigarEntry> => {
    const response = await fetch(buildUrl(`/api/cigars`), {
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
    const response = await fetch(buildUrl(`/api/cigars/${id}`), {
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
    const response = await fetch(buildUrl(`/api/cigars/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete cigar entry');
    }
  },

  // Drink entries
  getDrinkEntries: async (): Promise<DrinkEntry[]> => {
    const response = await fetch(buildUrl(`/api/drinks`));
    if (!response.ok) {
      throw new Error('Failed to fetch drink entries');
    }
    return response.json();
  },

  addDrinkEntry: async (entry: Omit<DrinkEntry, 'id'>): Promise<DrinkEntry> => {
    const response = await fetch(buildUrl(`/api/drinks`), {
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
    const response = await fetch(buildUrl(`/api/drinks/${id}`), {
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
    const response = await fetch(buildUrl(`/api/drinks/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete drink entry');
    }
  },

  // Cardio entries
  getCardioEntries: async (): Promise<CardioEntry[]> => {
    const response = await fetch(buildUrl(`/api/cardio`));
    if (!response.ok) {
      throw new Error('Failed to fetch cardio entries');
    }
    return response.json();
  },

  addCardioEntry: async (entry: Omit<CardioEntry, 'id'>): Promise<CardioEntry> => {
    const response = await fetch(buildUrl(`/api/cardio`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to add cardio entry');
    }
    return response.json();
  },

  updateCardioEntry: async (id: string, entry: Partial<CardioEntry>): Promise<CardioEntry> => {
    const response = await fetch(buildUrl(`/api/cardio/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to update cardio entry');
    }
    return response.json();
  },

  deleteCardioEntry: async (id: string): Promise<void> => {
    const response = await fetch(buildUrl(`/api/cardio/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete cardio entry');
    }
  },

  // Event entries
  getEventEntries: async (): Promise<EventEntry[]> => {
    const response = await fetch(buildUrl(`/api/events`));
    if (!response.ok) {
      throw new Error('Failed to fetch event entries');
    }
    return response.json();
  },

  addEventEntry: async (entry: Omit<EventEntry, 'id'>): Promise<EventEntry> => {
    const response = await fetch(buildUrl(`/api/events`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to add event entry');
    }
    return response.json();
  },

  updateEventEntry: async (id: string, entry: Partial<EventEntry>): Promise<EventEntry> => {
    const response = await fetch(buildUrl(`/api/events/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      throw new Error('Failed to update event entry');
    }
    return response.json();
  },

  deleteEventEntry: async (id: string): Promise<void> => {
    const response = await fetch(buildUrl(`/api/events/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete event entry');
    }
  },

  // Weight entries
  getWeightEntries: async (): Promise<WeightEntry[]> => {
    const url = buildUrl(`/api/weights`);
    console.log('Fetching weights from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('Failed to fetch weights:', response.status, text.substring(0, 200));
      throw new Error(`Failed to fetch weight entries: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON. Content-Type:', contentType, 'Response:', text.substring(0, 200));
      throw new Error('Response is not JSON. Check if backend is running.');
    }
    return response.json();
  },

  addWeightEntry: async (entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> => {
    const response = await fetch(buildUrl(`/api/weights`), {
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
    const response = await fetch(buildUrl(`/api/weights/${id}`), {
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
    const response = await fetch(buildUrl(`/api/weights/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete weight entry');
    }
  },
};
