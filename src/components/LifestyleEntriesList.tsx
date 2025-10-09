import React from 'react';
import { CigarEntry, DrinkEntry } from '../types';
import { Edit, Trash2, Calendar, Cigarette, Wine } from 'lucide-react';
import { format } from 'date-fns';

interface LifestyleEntriesListProps {
  cigarEntries: CigarEntry[];
  drinkEntries: DrinkEntry[];
  onEditCigar: (entry: CigarEntry) => void;
  onDeleteCigar: (id: string) => void;
  onEditDrink: (entry: DrinkEntry) => void;
  onDeleteDrink: (id: string) => void;
}

export const LifestyleEntriesList: React.FC<LifestyleEntriesListProps> = ({
  cigarEntries,
  drinkEntries,
  onEditCigar,
  onDeleteCigar,
  onEditDrink,
  onDeleteDrink
}) => {
  // Create separate arrays for cigars and drinks, keeping original data intact
  const cigarList = cigarEntries.map(entry => ({ ...entry, entryType: 'cigar' as const }));
  const drinkList = drinkEntries.map(entry => ({ ...entry, entryType: 'drink' as const }));
  
  // Combine and sort by timestamp
  const allEntries = [...cigarList, ...drinkList].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (allEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="flex justify-center space-x-4 mb-4">
            <Cigarette className="h-12 w-12 text-gray-400" />
            <Wine className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No lifestyle entries yet</p>
          <p className="text-gray-400 text-sm">Add your first cigar or drink entry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-primary-100 p-2 rounded-lg mr-3">
          <Calendar className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Lifestyle Entries</h3>
        <span className="ml-auto text-sm text-gray-500">
          {allEntries.length} entr{allEntries.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      <div className="space-y-4">
        {allEntries.map((entry) => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  {entry.entryType === 'cigar' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Cigarette className="h-5 w-5 text-orange-600" />
                        <span className="text-lg font-bold text-gray-900">
                          {entry.count} cigar{entry.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      {entry.brand && (
                        <span className="text-sm text-gray-500">
                          ({entry.brand})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Wine className="h-5 w-5 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">
                          {entry.count} drink{entry.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({entry.type || 'Unknown'})
                      </span>
                      {entry.alcoholContent && (
                        <span className="text-sm text-gray-500">
                          {entry.alcoholContent}% ABV
                        </span>
                      )}
                    </>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.entryType === 'cigar' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.entryType === 'cigar' ? '🚬 Cigar' : `🍷 ${entry.type || 'Unknown'}`}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(entry.timestamp), 'MMM dd, yyyy - h:mm a')}
                </div>
                
                {entry.notes && (
                  <div className="mt-2 text-sm text-gray-600 italic">
                    "{entry.notes}"
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => entry.entryType === 'cigar' 
                    ? onEditCigar(entry as CigarEntry) 
                    : onEditDrink(entry as DrinkEntry)
                  }
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit entry"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => entry.entryType === 'cigar' 
                    ? onDeleteCigar(entry.id) 
                    : onDeleteDrink(entry.id)
                  }
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};