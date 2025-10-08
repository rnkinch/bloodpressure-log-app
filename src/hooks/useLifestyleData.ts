import { useState, useEffect, useCallback } from 'react';
import { CigarEntry, DrinkEntry } from '../types';

export const useLifestyleData = () => {
  const [cigarEntries, setCigarEntries] = useState<CigarEntry[]>([]);
  const [drinkEntries, setDrinkEntries] = useState<DrinkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load lifestyle data from localStorage on mount
  useEffect(() => {
    const loadLifestyleData = () => {
      try {
        const savedCigars = localStorage.getItem('cigarEntries');
        const savedDrinks = localStorage.getItem('drinkEntries');
        
        if (savedCigars) {
          const cigars = JSON.parse(savedCigars).map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          setCigarEntries(cigars);
        }
        
        if (savedDrinks) {
          const drinks = JSON.parse(savedDrinks).map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          setDrinkEntries(drinks);
        }
      } catch (error) {
        console.error('Failed to load lifestyle data from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLifestyleData();
  }, []);

  // Cigar entry management
  const addCigarEntry = useCallback(async (entry: Omit<CigarEntry, 'id'>) => {
    try {
      const newEntry = await api.addCigarEntry(entry);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...newEntry,
        timestamp: new Date(newEntry.timestamp)
      };
      setCigarEntries(prev => [entryWithDate, ...prev]);
      return entryWithDate;
    } catch (error) {
      console.error('Failed to add cigar entry:', error);
      throw error;
    }
  }, []);

  const updateCigarEntry = useCallback(async (id: string, updates: Partial<CigarEntry>) => {
    try {
      const updatedEntry = await api.updateCigarEntry(id, updates);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...updatedEntry,
        timestamp: new Date(updatedEntry.timestamp)
      };
      setCigarEntries(prev =>
        prev.map(entry =>
          entry.id === id ? entryWithDate : entry
        )
      );
    } catch (error) {
      console.error('Failed to update cigar entry:', error);
      throw error;
    }
  }, []);

  const deleteCigarEntry = useCallback(async (id: string) => {
    try {
      await api.deleteCigarEntry(id);
      setCigarEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete cigar entry:', error);
      throw error;
    }
  }, []);

  // Drink entry management
  const addDrinkEntry = useCallback(async (entry: Omit<DrinkEntry, 'id'>) => {
    try {
      const newEntry = await api.addDrinkEntry(entry);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...newEntry,
        timestamp: new Date(newEntry.timestamp)
      };
      setDrinkEntries(prev => [entryWithDate, ...prev]);
      return entryWithDate;
    } catch (error) {
      console.error('Failed to add drink entry:', error);
      throw error;
    }
  }, []);

  const updateDrinkEntry = useCallback(async (id: string, updates: Partial<DrinkEntry>) => {
    try {
      const updatedEntry = await api.updateDrinkEntry(id, updates);
      // Convert timestamp string to Date object
      const entryWithDate = {
        ...updatedEntry,
        timestamp: new Date(updatedEntry.timestamp)
      };
      setDrinkEntries(prev =>
        prev.map(entry =>
          entry.id === id ? entryWithDate : entry
        )
      );
    } catch (error) {
      console.error('Failed to update drink entry:', error);
      throw error;
    }
  }, []);

  const deleteDrinkEntry = useCallback(async (id: string) => {
    try {
      await api.deleteDrinkEntry(id);
      setDrinkEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete drink entry:', error);
      throw error;
    }
  }, []);

  return {
    cigarEntries,
    drinkEntries,
    loading,
    addCigarEntry,
    updateCigarEntry,
    deleteCigarEntry,
    addDrinkEntry,
    updateDrinkEntry,
    deleteDrinkEntry
  };
};
