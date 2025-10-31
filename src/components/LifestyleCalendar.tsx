import React, { useState, useMemo } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import { format, parseISO, startOfDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './LifestyleCalendar.css';
import { CigarEntry, DrinkEntry, WeightEntry } from '../types';
import { Cigarette, Wine, Scale } from 'lucide-react';

// Setup the localizer for react-big-calendar using date-fns
import { dateFnsLocalizer } from 'react-big-calendar';
import { format as formatDateFns, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format: formatDateFns,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define event types for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'cigar' | 'drink' | 'weight';
  data: CigarEntry | DrinkEntry | WeightEntry;
}

// Define props for the LifestyleCalendar component
interface LifestyleCalendarProps {
  cigarEntries: CigarEntry[];
  drinkEntries: DrinkEntry[];
  weightEntries: WeightEntry[];
}

// Define the detail view component for a selected day
interface DayDetailProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ date, events, onClose }) => {
  const formattedDate = format(date, 'MMMM d, yyyy');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{formattedDate}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {events.length === 0 ? (
          <p className="text-gray-500">No lifestyle entries for this day.</p>
        ) : (
          <div className="space-y-4">
            {events.filter(e => e.type === 'cigar').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Cigarette className="h-5 w-5 mr-2 text-orange-600" />
                  Cigar Entries
                </h3>
                <ul className="mt-2 space-y-2">
                  {events
                    .filter(e => e.type === 'cigar')
                    .map(event => {
                      const cigar = event.data as CigarEntry;
                      return (
                        <li key={event.id} className="bg-orange-50 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Count: {cigar.count}</span>
                            <span className="text-sm text-gray-500">
                              {format(cigar.timestamp, 'h:mm a')}
                            </span>
                          </div>
                          {cigar.brand && <p className="text-sm">Brand: {cigar.brand}</p>}
                          {cigar.notes && <p className="text-sm mt-1 text-gray-600">{cigar.notes}</p>}
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
            
            {events.filter(e => e.type === 'drink').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Wine className="h-5 w-5 mr-2 text-blue-600" />
                  Drink Entries
                </h3>
                <ul className="mt-2 space-y-2">
                  {events
                    .filter(e => e.type === 'drink')
                    .map(event => {
                      const drink = event.data as DrinkEntry;
                      return (
                        <li key={event.id} className="bg-blue-50 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Count: {drink.count}</span>
                            <span className="text-sm text-gray-500">
                              {format(drink.timestamp, 'h:mm a')}
                            </span>
                          </div>
                          {drink.type && <p className="text-sm">Type: {drink.type}</p>}
                          {drink.alcoholContent && (
                            <p className="text-sm">Alcohol Content: {drink.alcoholContent}%</p>
                          )}
                          {drink.notes && <p className="text-sm mt-1 text-gray-600">{drink.notes}</p>}
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
            
            {events.filter(e => e.type === 'weight').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-green-600" />
                  Weight Entries
                </h3>
                <ul className="mt-2 space-y-2">
                  {events
                    .filter(e => e.type === 'weight')
                    .map(event => {
                      const weight = event.data as WeightEntry;
                      return (
                        <li key={event.id} className="bg-green-50 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">Weight: {weight.weight}</span>
                            <span className="text-sm text-gray-500">
                              {format(weight.timestamp, 'h:mm a')}
                            </span>
                          </div>
                          {weight.notes && <p className="text-sm mt-1 text-gray-600">{weight.notes}</p>}
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const LifestyleCalendar: React.FC<LifestyleCalendarProps> = ({
  cigarEntries,
  drinkEntries,
  weightEntries,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState({
    cigar: true,
    drink: true,
    weight: true,
  });

  // Transform the lifestyle data into calendar events
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    
    // Add cigar entries
    if (filters.cigar) {
      cigarEntries.forEach(entry => {
        allEvents.push({
          id: `cigar-${entry.id}`,
          title: `Cigars: ${entry.count}`,
          start: entry.timestamp,
          end: entry.timestamp,
          type: 'cigar',
          data: entry,
        });
      });
    }
    
    // Add drink entries
    if (filters.drink) {
      drinkEntries.forEach(entry => {
        allEvents.push({
          id: `drink-${entry.id}`,
          title: `Drinks: ${entry.count}`,
          start: entry.timestamp,
          end: entry.timestamp,
          type: 'drink',
          data: entry,
        });
      });
    }
    
    // Add weight entries
    if (filters.weight) {
      weightEntries.forEach(entry => {
        allEvents.push({
          id: `weight-${entry.id}`,
          title: `Weight: ${entry.weight}`,
          start: entry.timestamp,
          end: entry.timestamp,
          type: 'weight',
          data: entry,
        });
      });
    }
    
    return allEvents;
  }, [cigarEntries, drinkEntries, weightEntries, filters]);

  // Handle day selection
  const handleSelectSlot = ({ start }: { start: Date }) => {
    const dayStart = startOfDay(start);
    const dayEvents = events.filter(event => {
      const eventDate = startOfDay(event.start);
      return eventDate.getTime() === dayStart.getTime();
    });
    
    setSelectedDate(dayStart);
    setSelectedEvents(dayEvents);
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'cigar':
        backgroundColor = '#f97316'; // orange-500
        break;
      case 'drink':
        backgroundColor = '#2563eb'; // blue-600
        break;
      case 'weight':
        backgroundColor = '#16a34a'; // green-600
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
        padding: '2px 5px',
      },
    };
  };

  // Toggle filter
  const toggleFilter = (type: 'cigar' | 'drink' | 'weight') => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lifestyle Calendar</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleFilter('cigar')}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filters.cigar
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Cigarette className={`h-4 w-4 mr-1 ${filters.cigar ? 'text-orange-600' : 'text-gray-400'}`} />
            Cigars
          </button>
          <button
            onClick={() => toggleFilter('drink')}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filters.drink
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Wine className={`h-4 w-4 mr-1 ${filters.drink ? 'text-blue-600' : 'text-gray-400'}`} />
            Drinks
          </button>
          <button
            onClick={() => toggleFilter('weight')}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filters.weight
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Scale className={`h-4 w-4 mr-1 ${filters.weight ? 'text-green-600' : 'text-gray-400'}`} />
            Weight
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month']}
          defaultView={Views.MONTH}
          eventPropGetter={eventStyleGetter}
          onSelectSlot={handleSelectSlot}
          selectable
          popup
        />
      </div>
      
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          events={selectedEvents}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

export default LifestyleCalendar;
