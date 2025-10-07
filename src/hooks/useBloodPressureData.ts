import { useState, useEffect, useCallback } from 'react';
import { BloodPressureReading } from '../types';
import { api } from '../utils/api';

export const useBloodPressureData = () => {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [loading, setLoading] = useState(true);

  // Load readings from API on mount
  useEffect(() => {
    const loadReadings = async () => {
      try {
        const loadedReadings = await api.getReadings();
        // Convert timestamp strings back to Date objects
        const readingsWithDates = loadedReadings.map(reading => ({
          ...reading,
          timestamp: new Date(reading.timestamp)
        }));
        setReadings(readingsWithDates);
      } catch (error) {
        console.error('Failed to load readings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReadings();
  }, []);

  const addNewReading = useCallback(async (reading: Omit<BloodPressureReading, 'id'>) => {
    try {
      const newReading = await api.addReading(reading);
      // Convert timestamp string to Date object
      const readingWithDate = {
        ...newReading,
        timestamp: new Date(newReading.timestamp)
      };
      setReadings(prev => [readingWithDate, ...prev]);
      return readingWithDate;
    } catch (error) {
      console.error('Failed to add reading:', error);
      throw error;
    }
  }, []);

  const removeReading = useCallback(async (id: string) => {
    try {
      await api.deleteReading(id);
      setReadings(prev => prev.filter(reading => reading.id !== id));
    } catch (error) {
      console.error('Failed to delete reading:', error);
      throw error;
    }
  }, []);

  const editReading = useCallback(async (id: string, updates: Partial<BloodPressureReading>) => {
    try {
      const updatedReading = await api.updateReading(id, updates);
      // Convert timestamp string to Date object
      const readingWithDate = {
        ...updatedReading,
        timestamp: new Date(updatedReading.timestamp)
      };
      setReadings(prev =>
        prev.map(reading =>
          reading.id === id ? readingWithDate : reading
        )
      );
    } catch (error) {
      console.error('Failed to update reading:', error);
      throw error;
    }
  }, []);

  return {
    readings,
    loading,
    addReading: addNewReading,
    deleteReading: removeReading,
    updateReading: editReading
  };
};
