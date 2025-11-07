import { useState, useEffect, useCallback } from 'react';
import { CardioEntry, CigarEntry, DrinkEntry } from '../types';
import { api } from '../utils/api';

export const useLifestyleData = () => {
  const [cigarEntries, setCigarEntries] = useState<CigarEntry[]>([]);
  const [drinkEntries, setDrinkEntries] = useState<DrinkEntry[]>([]);
  const [cardioEntries, setCardioEntries] = useState<CardioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load lifestyle data from API on mount
  useEffect(() => {
    const loadLifestyleData = async () => {
      try {
        console.log('Loading lifestyle data from API...');
        const [cigars, drinks, cardio] = await Promise.all([
          api.getCigarEntries(),
          api.getDrinkEntries(),
          api.getCardioEntries()
        ]);
        
        console.log('Loaded cigars:', cigars);
        console.log('Loaded drinks:', drinks);
        
        // Convert timestamp strings back to Date objects
        const cigarsWithDates = cigars.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        const drinksWithDates = drinks.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        const cardioWithDates = cardio.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        
        setCigarEntries(cigarsWithDates);
        setDrinkEntries(drinksWithDates);
        setCardioEntries(cardioWithDates);
      } catch (error) {
        console.error('Failed to load lifestyle data from API:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLifestyleData();
  }, []);

  // Cigar entry management
  const addCigarEntry = useCallback(async (entry: Omit<CigarEntry, 'id'>) => {
    try {
      console.log('Adding cigar entry:', entry);
      const newEntry = await api.addCigarEntry(entry);
      console.log('Added cigar entry:', newEntry);
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

  // Cardio entry management
  const addCardioEntry = useCallback(async (entry: Omit<CardioEntry, 'id'>) => {
    try {
      const newEntry = await api.addCardioEntry(entry);
      const entryWithDate = {
        ...newEntry,
        timestamp: new Date(newEntry.timestamp)
      };
      setCardioEntries(prev => [entryWithDate, ...prev]);
      return entryWithDate;
    } catch (error) {
      console.error('Failed to add cardio entry:', error);
      throw error;
    }
  }, []);

  const updateCardioEntry = useCallback(async (id: string, updates: Partial<CardioEntry>) => {
    try {
      const updatedEntry = await api.updateCardioEntry(id, updates);
      const entryWithDate = {
        ...updatedEntry,
        timestamp: new Date(updatedEntry.timestamp)
      };
      setCardioEntries(prev =>
        prev.map(entry =>
          entry.id === id ? entryWithDate : entry
        )
      );
    } catch (error) {
      console.error('Failed to update cardio entry:', error);
      throw error;
    }
  }, []);

  const deleteCardioEntry = useCallback(async (id: string) => {
    try {
      await api.deleteCardioEntry(id);
      setCardioEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete cardio entry:', error);
      throw error;
    }
  }, []);

  return {
    cigarEntries,
    drinkEntries,
    cardioEntries,
    loading,
    addCigarEntry,
    updateCigarEntry,
    deleteCigarEntry,
    addDrinkEntry,
    updateDrinkEntry,
    deleteDrinkEntry,
    addCardioEntry,
    updateCardioEntry,
    deleteCardioEntry
  };
};
