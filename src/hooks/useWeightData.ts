import { useState, useEffect, useCallback } from 'react';
import { WeightEntry } from '../types';
import { api } from '../utils/api';

export const useWeightData = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load weight data from API on mount
  useEffect(() => {
    const loadWeightData = async () => {
      try {
        console.log('Loading weight data from API...');
        const weights = await api.getWeightEntries();
        
        console.log('Loaded weights:', weights);
        
        // Convert timestamp strings back to Date objects
        const weightsWithDates = weights.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        
        setWeightEntries(weightsWithDates);
      } catch (error) {
        console.error('Failed to load weight data from API:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWeightData();
  }, []);

  // Weight entry management
  const addWeightEntry = useCallback(async (entry: Omit<WeightEntry, 'id'>) => {
    try {
      console.log('Adding weight entry:', entry);
      const newEntry = await api.addWeightEntry(entry);
      console.log('Added weight entry:', newEntry);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...newEntry,
        timestamp: new Date(newEntry.timestamp)
      };
      setWeightEntries(prev => [entryWithDate, ...prev]);
      return entryWithDate;
    } catch (error) {
      console.error('Failed to add weight entry:', error);
      throw error;
    }
  }, []);

  const updateWeightEntry = useCallback(async (id: string, updates: Partial<WeightEntry>) => {
    try {
      const updatedEntry = await api.updateWeightEntry(id, updates);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...updatedEntry,
        timestamp: new Date(updatedEntry.timestamp)
      };
      setWeightEntries(prev =>
        prev.map(entry =>
          entry.id === id ? entryWithDate : entry
        )
      );
    } catch (error) {
      console.error('Failed to update weight entry:', error);
      throw error;
    }
  }, []);

  const deleteWeightEntry = useCallback(async (id: string) => {
    try {
      await api.deleteWeightEntry(id);
      setWeightEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete weight entry:', error);
      throw error;
    }
  }, []);

  return {
    weightEntries,
    loading,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry
  };
};
