import { BloodPressureReading } from '../types';

const STORAGE_KEY = 'bloodPressureReadings';

export const saveReadings = (readings: BloodPressureReading[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch (error) {
    console.error('Failed to save readings to localStorage:', error);
  }
};

export const loadReadings = (): BloodPressureReading[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const readings = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return readings.map((reading: any) => ({
        ...reading,
        timestamp: new Date(reading.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load readings from localStorage:', error);
  }
  return [];
};

export const addReading = (reading: Omit<BloodPressureReading, 'id'>): BloodPressureReading => {
  const readings = loadReadings();
  const newReading: BloodPressureReading = {
    ...reading,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
  };
  const updatedReadings = [...readings, newReading];
  saveReadings(updatedReadings);
  return newReading;
};

export const deleteReading = (id: string): void => {
  const readings = loadReadings();
  const updatedReadings = readings.filter(reading => reading.id !== id);
  saveReadings(updatedReadings);
};

export const updateReading = (id: string, updates: Partial<BloodPressureReading>): void => {
  const readings = loadReadings();
  const updatedReadings = readings.map(reading => 
    reading.id === id ? { ...reading, ...updates } : reading
  );
  saveReadings(updatedReadings);
};
