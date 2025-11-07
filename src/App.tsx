import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useBloodPressureData } from './hooks/useBloodPressureData';
import { useLifestyleData } from './hooks/useLifestyleData';
import { useWeightData } from './hooks/useWeightData';
import { CardioEntry, DrinkEntry, EventEntry, WeightEntry } from './types';
import { BloodPressureForm } from './components/BloodPressureForm';
import { BloodPressureChart } from './components/BloodPressureChart';
import { AIAnalysis } from './components/AIAnalysis';
import EnhancedAIFeatures from './components/EnhancedAIFeatures';
import { BloodPressureStatsComponent } from './components/BloodPressureStats';
import { ReadingsList } from './components/ReadingsList';
import { CigarForm } from './components/CigarForm';
import { DrinkForm } from './components/DrinkForm';
import CardioForm from './components/CardioForm';
import EventForm from './components/EventForm';
import { WeightForm } from './components/WeightForm';
import { LifestyleEntriesList } from './components/LifestyleEntriesList';
import LifestyleCalendar from './components/LifestyleCalendar';
import { WeightEntriesList } from './components/WeightEntriesList';
import { PrintReport } from './components/PrintReport';
import { calculateStats, analyzeTrends, prepareChartData } from './utils/analysis';
import { Heart, Plus, BarChart3, Brain, Activity, List, Cigarette, Wine, Scale, Printer, CalendarDays, ChevronDown, StickyNote } from 'lucide-react';
import './App.css';

type ViewMode = 'form' | 'chart' | 'ai-assistant' | 'stats' | 'readings' | 'cigar' | 'drink' | 'cardio' | 'event' | 'weight' | 'lifestyle' | 'print' | 'calendar';

function App() {
  const { readings, loading, addReading, updateReading, deleteReading } = useBloodPressureData();
  const { 
    cigarEntries, 
    drinkEntries, 
    cardioEntries,
    eventEntries,
    loading: lifestyleLoading,
    addCigarEntry,
    updateCigarEntry,
    deleteCigarEntry,
    addDrinkEntry,
    updateDrinkEntry,
    deleteDrinkEntry,
    addCardioEntry,
    updateCardioEntry,
    deleteCardioEntry,
    addEventEntry,
    updateEventEntry,
    deleteEventEntry
  } = useLifestyleData();
  
  const {
    weightEntries,
    loading: weightLoading,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry
  } = useWeightData();
  
  const [currentView, setCurrentView] = useState<ViewMode>('form');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [editingReading, setEditingReading] = useState<any>(null);
  const [editingCigar, setEditingCigar] = useState<any>(null);
  const [editingDrink, setEditingDrink] = useState<DrinkEntry | null>(null);
  const [editingCardio, setEditingCardio] = useState<CardioEntry | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventEntry | null>(null);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  
  const filteredChartData = useMemo(() => {
    const now = new Date();
    let filtered = readings;
    
    if (chartPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = readings.filter(r => r.timestamp >= weekAgo);
    } else if (chartPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = readings.filter(r => r.timestamp >= monthAgo);
    }
    
    return prepareChartData(filtered, cigarEntries, drinkEntries, weightEntries, cardioEntries, eventEntries);
  }, [readings, chartPeriod, cigarEntries, drinkEntries, weightEntries, cardioEntries, eventEntries]);

  const stats = useMemo(() => calculateStats(readings, chartPeriod), [readings, chartPeriod]);
  const analysis = useMemo(() => analyzeTrends(readings, cigarEntries, drinkEntries), [readings, cigarEntries, drinkEntries]);

  const handleAddReading = async (reading: any) => {
    try {
      await addReading(reading);
      setCurrentView('chart');
    } catch (error) {
      console.error('Failed to add reading:', error);
    }
  };

  const handleEditReading = (reading: any) => {
    setEditingReading(reading);
    setCurrentView('form');
  };

  const handleUpdateReading = async (reading: any) => {
    try {
      await updateReading(editingReading.id, reading);
      setEditingReading(null);
      setCurrentView('chart');
    } catch (error) {
      console.error('Failed to update reading:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setCurrentView('chart');
  };

  // Lifestyle handlers
  const handleAddCigar = async (cigar: any) => {
    try {
      await addCigarEntry(cigar);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add cigar entry:', error);
    }
  };

  const handleEditCigar = (cigar: any) => {
    setEditingCigar(cigar);
    setCurrentView('cigar');
  };

  const handleUpdateCigar = async (cigar: any) => {
    try {
      await updateCigarEntry(editingCigar.id, cigar);
      setEditingCigar(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update cigar entry:', error);
    }
  };

  const handleDeleteCigar = async (id: string) => {
    try {
      await deleteCigarEntry(id);
    } catch (error) {
      console.error('Failed to delete cigar entry:', error);
    }
  };

  const handleCancelCigarEdit = () => {
    setEditingCigar(null);
    setCurrentView('lifestyle');
  };

  const handleAddDrink = async (drink: any) => {
    try {
      await addDrinkEntry(drink);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add drink entry:', error);
    }
  };

  const handleEditDrink = (drink: DrinkEntry) => {
    console.log('App - handleEditDrink called with:', drink);
    setEditingDrink(drink);
    setCurrentView('drink');
  };

  const handleUpdateDrink = async (drink: any) => {
    if (!editingDrink) return;
    
    try {
      await updateDrinkEntry(editingDrink.id, drink);
      setEditingDrink(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update drink entry:', error);
    }
  };

  const handleDeleteDrink = async (id: string) => {
    try {
      await deleteDrinkEntry(id);
    } catch (error) {
      console.error('Failed to delete drink entry:', error);
    }
  };

  const handleCancelDrinkEdit = () => {
    setEditingDrink(null);
    setCurrentView('lifestyle');
  };

  // Event handlers
  const handleAddEvent = async (event: Omit<EventEntry, 'id'>) => {
    try {
      await addEventEntry(event);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add event entry:', error);
    }
  };

  const handleEditEvent = (event: EventEntry) => {
    setEditingEvent(event);
    setCurrentView('event');
  };

  const handleUpdateEvent = async (event: Omit<EventEntry, 'id'>) => {
    if (!editingEvent) return;

    try {
      await updateEventEntry(editingEvent.id, event);
      setEditingEvent(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update event entry:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEventEntry(id);
    } catch (error) {
      console.error('Failed to delete event entry:', error);
    }
  };

  const handleCancelEventEdit = () => {
    setEditingEvent(null);
    setCurrentView('lifestyle');
  };

  // Cardio handlers
  const handleAddCardio = async (cardio: Omit<CardioEntry, 'id'>) => {
    try {
      await addCardioEntry(cardio);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add cardio entry:', error);
    }
  };

  const handleEditCardio = (cardio: CardioEntry) => {
    setEditingCardio(cardio);
    setCurrentView('cardio');
  };

  const handleUpdateCardio = async (cardio: Omit<CardioEntry, 'id'>) => {
    if (!editingCardio) return;

    try {
      await updateCardioEntry(editingCardio.id, cardio);
      setEditingCardio(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update cardio entry:', error);
    }
  };

  const handleDeleteCardio = async (id: string) => {
    try {
      await deleteCardioEntry(id);
    } catch (error) {
      console.error('Failed to delete cardio entry:', error);
    }
  };

  const handleCancelCardioEdit = () => {
    setEditingCardio(null);
    setCurrentView('lifestyle');
  };

  // Weight handlers
  const handleAddWeight = async (weight: any) => {
    try {
      await addWeightEntry(weight);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add weight entry:', error);
    }
  };

  const handleEditWeight = (weight: WeightEntry) => {
    setEditingWeight(weight);
    setCurrentView('weight');
  };

  const handleUpdateWeight = async (weight: any) => {
    if (!editingWeight) return;
    
    try {
      await updateWeightEntry(editingWeight.id, weight);
      setEditingWeight(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update weight entry:', error);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      await deleteWeightEntry(id);
    } catch (error) {
      console.error('Failed to delete weight entry:', error);
    }
  };

  const handleCancelWeightEdit = () => {
    setEditingWeight(null);
    setCurrentView('lifestyle');
  };

  if (loading || lifestyleLoading || weightLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your blood pressure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-lg mr-3">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Blood Pressure Tracker</h1>
            </div>
            <div className="text-sm text-gray-500">
              {readings.length} reading{readings.length !== 1 ? 's' : ''} logged
              <span className="ml-2 text-xs">
                ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {/* Add Reading Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${['form', 'cigar', 'drink', 'cardio', 'event', 'weight'].includes(currentView) ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setCurrentView('form');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Blood Pressure
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('cigar');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Cigarette className="h-4 w-4 mr-2 text-orange-500" />
                    Cigar
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('drink');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Wine className="h-4 w-4 mr-2 text-blue-500" />
                    Drink
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('cardio');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Activity className="h-4 w-4 mr-2 text-purple-500" />
                    Cardio
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('event');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <StickyNote className="h-4 w-4 mr-2 text-amber-500" />
                    Event
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('weight');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Scale className="h-4 w-4 mr-2 text-green-500" />
                    Weight
                  </button>
                </div>
              )}
            </div>
            
            {/* Other Navigation Items */}
            {[
              { id: 'readings', label: 'All Readings', icon: List },
              { id: 'chart', label: 'Charts', icon: BarChart3 },
              { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
              { id: 'stats', label: 'Statistics', icon: Activity },
              { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
              { id: 'calendar', label: 'Calendar', icon: CalendarDays },
              { id: 'print', label: 'Print Report', icon: Printer }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'form' && (
          <div className="max-w-2xl mx-auto">
            <BloodPressureForm
              onSubmit={editingReading ? handleUpdateReading : handleAddReading}
              onCancel={editingReading ? handleCancelEdit : undefined}
              initialData={editingReading}
              isEditing={!!editingReading}
            />
          </div>
        )}

        {currentView === 'chart' && (
          <div className="space-y-6">
            <BloodPressureChart
              data={filteredChartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
        )}

        {currentView === 'ai-assistant' && (
          <div className="max-w-6xl mx-auto">
            <EnhancedAIFeatures />
          </div>
        )}

        {currentView === 'stats' && (
          <div className="max-w-4xl mx-auto">
            <BloodPressureStatsComponent stats={stats} />
          </div>
        )}

        {currentView === 'readings' && (
          <div className="max-w-4xl mx-auto">
            <ReadingsList
              readings={readings}
              onEdit={handleEditReading}
              onDelete={async (id) => {
                try {
                  await deleteReading(id);
                } catch (error) {
                  console.error('Failed to delete reading:', error);
                }
              }}
            />
          </div>
        )}

        {currentView === 'cigar' && (
          <div className="max-w-2xl mx-auto">
            <CigarForm
              onSubmit={editingCigar ? handleUpdateCigar : handleAddCigar}
              onCancel={editingCigar ? handleCancelCigarEdit : undefined}
              initialData={editingCigar}
              isEditing={!!editingCigar}
            />
          </div>
        )}

        {currentView === 'drink' && (
          <div className="max-w-2xl mx-auto">
            {editingDrink ? (
              <DrinkForm
                key={editingDrink.id}
                onSubmit={handleUpdateDrink}
                onCancel={handleCancelDrinkEdit}
                initialData={editingDrink}
                isEditing={true}
              />
            ) : (
              <DrinkForm
                key="new"
                onSubmit={handleAddDrink}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
          </div>
        )}

        {currentView === 'cardio' && (
          <div className="max-w-2xl mx-auto">
            {editingCardio ? (
              <CardioForm
                key={editingCardio.id}
                onSubmit={handleUpdateCardio}
                onCancel={handleCancelCardioEdit}
                initialData={editingCardio}
                isEditing={true}
              />
            ) : (
              <CardioForm
                key="new"
                onSubmit={handleAddCardio}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
          </div>
        )}

        {currentView === 'event' && (
          <div className="max-w-2xl mx-auto">
            {editingEvent ? (
              <EventForm
                key={editingEvent.id}
                onSubmit={handleUpdateEvent}
                onCancel={handleCancelEventEdit}
                initialData={editingEvent}
                isEditing={true}
              />
            ) : (
              <EventForm
                key="new"
                onSubmit={handleAddEvent}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
          </div>
        )}

        {currentView === 'weight' && (
          <div className="max-w-2xl mx-auto">
            {editingWeight ? (
              <WeightForm
                key={editingWeight.id}
                onSubmit={handleUpdateWeight}
                onCancel={handleCancelWeightEdit}
                initialData={editingWeight}
                isEditing={true}
              />
            ) : (
              <WeightForm
                key="new"
                onSubmit={handleAddWeight}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
          </div>
        )}

        {currentView === 'lifestyle' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentView('cigar')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Cigarette className="h-4 w-4 mr-2" />
                Add Cigar Entry
              </button>
              <button
                onClick={() => setCurrentView('drink')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Wine className="h-4 w-4 mr-2" />
                Add Drink Entry
              </button>
              <button
                onClick={() => setCurrentView('cardio')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                Add Cardio Entry
              </button>
              <button
                onClick={() => setCurrentView('event')}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Add Event
              </button>
              <button
                onClick={() => setCurrentView('weight')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Scale className="h-4 w-4 mr-2" />
                Add Weight Entry
              </button>
            </div>
            <LifestyleEntriesList
              cigarEntries={cigarEntries}
              drinkEntries={drinkEntries}
              cardioEntries={cardioEntries}
              eventEntries={eventEntries}
              onEditCigar={handleEditCigar}
              onDeleteCigar={handleDeleteCigar}
              onEditDrink={handleEditDrink}
              onDeleteDrink={handleDeleteDrink}
              onEditCardio={handleEditCardio}
              onDeleteCardio={handleDeleteCardio}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
            <WeightEntriesList
              weightEntries={weightEntries}
              onEdit={handleEditWeight}
              onDelete={handleDeleteWeight}
            />
          </div>
        )}

        {currentView === 'print' && (
          <div className="max-w-7xl mx-auto">
            <PrintReport
              readings={readings}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="max-w-7xl mx-auto">
            <LifestyleCalendar
              cigarEntries={cigarEntries}
              drinkEntries={drinkEntries}
              weightEntries={weightEntries}
              cardioEntries={cardioEntries}
              eventEntries={eventEntries}
              onEditCigar={handleEditCigar}
              onEditDrink={handleEditDrink}
              onEditCardio={handleEditCardio}
              onEditEvent={handleEditEvent}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Blood Pressure Tracker - Track your health with AI-powered insights</p>
            <p className="mt-1">
              This app is for informational purposes only. Always consult with a healthcare provider for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
