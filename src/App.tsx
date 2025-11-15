import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useBloodPressureData } from './hooks/useBloodPressureData';
import { useLifestyleData } from './hooks/useLifestyleData';
import { useWeightData } from './hooks/useWeightData';
import { CardioEntry, DrinkEntry, EventEntry, WeightEntry, TimeRangeFilter } from './types';
import { BloodPressureForm } from './components/BloodPressureForm';
import { BloodPressureChart } from './components/BloodPressureChart';
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
import { calculateStats, analyzeTrends, prepareChartData, filterReadingsByTimeRange } from './utils/analysis';
import { Heart, Plus, BarChart3, Activity, List, Cigarette, Wine, Scale, Printer, CalendarDays, ChevronDown, StickyNote, Menu, X } from 'lucide-react';
import './App.css';

type ViewMode = 'form' | 'chart' | 'stats' | 'readings' | 'cigar' | 'drink' | 'cardio' | 'event' | 'weight' | 'lifestyle' | 'print' | 'calendar';

const DEFAULT_TIME_BAND: TimeRangeFilter = {
  enabled: false,
  startHour: 14,
  endHour: 16,
  label: 'Custom Range',
};

const normalizeHourComponents = (hour: number) => {
  let baseHour = Math.floor(hour);
  let minutes = Math.round((hour - baseHour) * 60);

  if (minutes === 60) {
    baseHour += 1;
    minutes = 0;
  }

  const normalizedHour = ((baseHour % 24) + 24) % 24;

  return { hour: normalizedHour, minutes };
};

const formatHourToDisplay = (hour: number) => {
  const { hour: normalizedHour, minutes } = normalizeHourComponents(hour);
  const date = new Date(0, 0, 0, normalizedHour, minutes);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    if (!dropdownOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && 
          buttonRef.current && !buttonRef.current.contains(target)) {
        setDropdownOpen(false);
        setDropdownPosition(null);
      }
    }
    
    function handleScroll() {
      setDropdownOpen(false);
      setDropdownPosition(null);
    }
    
    // Use click event instead of mousedown, and add delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [dropdownOpen]);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [timeBandFilter, setTimeBandFilter] = useState<TimeRangeFilter>({ ...DEFAULT_TIME_BAND });
  const [editingReading, setEditingReading] = useState<any>(null);
  const [editingCigar, setEditingCigar] = useState<any>(null);
  const [editingDrink, setEditingDrink] = useState<DrinkEntry | null>(null);
  const [editingCardio, setEditingCardio] = useState<CardioEntry | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventEntry | null>(null);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  
  const timeOptions = useMemo(
    () =>
      Array.from({ length: 24 * 6 }, (_, index) => {
        const minutes = index * 10;
        const hourValue = minutes / 60;
        return {
          minutes,
          label: formatHourToDisplay(hourValue),
        };
      }).filter(option => option.minutes >= 4 * 60 && option.minutes < 22 * 60),
    []
  );

  useEffect(() => {
    if (timeOptions.length === 0) {
      return;
    }

    const allowedMinutes = new Set(timeOptions.map(option => option.minutes));
    const startMinutes = Math.round(timeBandFilter.startHour * 60);
    const endMinutes = Math.round(timeBandFilter.endHour * 60);

    if (allowedMinutes.has(startMinutes) && allowedMinutes.has(endMinutes)) {
      return;
    }

    setTimeBandFilter(prev => ({
      ...prev,
      startHour: DEFAULT_TIME_BAND.startHour,
      endHour: DEFAULT_TIME_BAND.endHour,
    }));
  }, [timeOptions, timeBandFilter.startHour, timeBandFilter.endHour]);

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
    
    const timeFiltered = filterReadingsByTimeRange(filtered, timeBandFilter);

    return prepareChartData(timeFiltered, cigarEntries, drinkEntries, weightEntries, cardioEntries, eventEntries);
  }, [readings, chartPeriod, cigarEntries, drinkEntries, weightEntries, cardioEntries, eventEntries, timeBandFilter]);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center flex-1 min-w-0">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl mr-2 sm:mr-4 shadow-lg flex-shrink-0">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Blood Pressure Tracker</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">Monitor your health trends</p>
              </div>
            </div>
            <div className="glass-card px-3 sm:px-4 py-2 rounded-xl hidden sm:block flex-shrink-0 ml-4">
              <div className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                {readings.length} reading{readings.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 hidden lg:block">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden ml-2 p-2 rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
          {/* Mobile stats */}
          <div className="sm:hidden mt-2 pb-2">
            <div className="glass-card px-3 py-2 rounded-lg">
              <div className="text-xs font-semibold text-gray-700">
                {readings.length} reading{readings.length !== 1 ? 's' : ''} logged
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`glass-card border-b border-white/30 relative ${mobileMenuOpen ? '' : 'hidden sm:block'}`} style={{ zIndex: 30, overflow: 'visible' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide pb-2 sm:pb-0" style={{ position: 'relative', zIndex: 30, overflowY: 'visible' }}>
            {/* Add Reading Dropdown */}
            <div className="relative" style={{ zIndex: 50 }}>
              <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                  if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom - 2, // Reduced offset to bring it closer
                      left: rect.left
                    });
                  }
                  console.log('Dropdown button clicked, current state:', dropdownOpen);
                  setDropdownOpen(!dropdownOpen);
                }}
                className={`flex items-center px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${['form', 'cigar', 'drink', 'cardio', 'event', 'weight'].includes(currentView) ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                style={{ pointerEvents: 'auto' }}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Entry</span>
                <span className="sm:hidden">Add</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              
              {dropdownOpen && dropdownPosition && (
                <div 
                  ref={dropdownRef}
                  className="fixed w-48 bg-white rounded-xl shadow-xl py-2 border-2 border-gray-200"
                  style={{ 
                    zIndex: 9999, 
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('form');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Blood Pressure
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('cigar');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Cigarette className="h-4 w-4 mr-2 text-orange-500" />
                    Cigar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('drink');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Wine className="h-4 w-4 mr-2 text-blue-500" />
                    Drink
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('cardio');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Activity className="h-4 w-4 mr-2 text-purple-500" />
                    Cardio
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('event');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <StickyNote className="h-4 w-4 mr-2 text-amber-500" />
                    Event
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView('weight');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
              { id: 'stats', label: 'Statistics', icon: Activity },
              { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
              { id: 'calendar', label: 'Calendar', icon: CalendarDays },
              { id: 'print', label: 'Print Report', icon: Printer }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentView(id as ViewMode);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                  currentView === id
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-white/30'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
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
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily Time Band</h3>
                    <p className="text-sm text-gray-500">
                      Filter your blood pressure readings to a specific time window each day.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={timeBandFilter.enabled}
                        onChange={(event) =>
                          setTimeBandFilter((prev) => ({
                            ...prev,
                            enabled: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      Enabled
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="time-band-start">
                        Start
                      </label>
                      <select
                        id="time-band-start"
                        value={Math.round(timeBandFilter.startHour * 60)}
                        onChange={(event) =>
                          setTimeBandFilter((prev) => ({
                            ...prev,
                            startHour: Number(event.target.value) / 60,
                          }))
                        }
                        disabled={!timeBandFilter.enabled}
                        className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          timeBandFilter.enabled ? 'bg-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {timeOptions.map(({ minutes, label }) => (
                          <option key={minutes} value={minutes}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="time-band-end">
                        End
                      </label>
                      <select
                        id="time-band-end"
                        value={Math.round(timeBandFilter.endHour * 60)}
                        onChange={(event) =>
                          setTimeBandFilter((prev) => ({
                            ...prev,
                            endHour: Number(event.target.value) / 60,
                          }))
                        }
                        disabled={!timeBandFilter.enabled}
                        className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          timeBandFilter.enabled ? 'bg-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {timeOptions.map(({ minutes, label }) => (
                          <option key={minutes} value={minutes}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimeBandFilter({ ...DEFAULT_TIME_BAND })}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {timeBandFilter.enabled && timeBandFilter.startHour > timeBandFilter.endHour && (
                  <p className="text-sm text-amber-600">
                    This range wraps past midnight and will capture readings after {formatHourToDisplay(timeBandFilter.startHour)} and before {formatHourToDisplay(timeBandFilter.endHour)} the next day.
                  </p>
                )}
              </div>
            </div>
            <BloodPressureChart
              data={filteredChartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              timeBand={timeBandFilter}
            />
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
            <p>Blood Pressure Tracker - Monitor and understand your health trends</p>
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
