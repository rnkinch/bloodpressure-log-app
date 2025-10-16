import React from 'react';
import { BloodPressureReading } from '../types';
import { format } from 'date-fns';
import { Printer, FileText } from 'lucide-react';

interface PrintReportProps {
  readings: BloodPressureReading[];
}

export const PrintReport: React.FC<PrintReportProps> = ({
  readings
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getSortedReadings = () => {
    return [...readings]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No readings to print</p>
          <p className="text-gray-400 text-sm">Add blood pressure readings first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Screen Only: Print Button */}
      <div className="print:hidden p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blood Pressure Report</h2>
            <p className="text-sm text-gray-600">
              Print this report to share with your doctor
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-report p-6">
        {/* Header */}
        <div className="print-header mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Pressure Log</h1>
          <p className="text-sm text-gray-600">
            Generated: {format(new Date(), 'MMMM dd, yyyy - h:mm a')}
          </p>
          <p className="text-sm text-gray-600">
            Total Readings: {readings.length}
          </p>
        </div>

        {/* Patient Information Section */}
        <div className="mb-8 print-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <div>
              <span className="font-semibold">Name:</span>
              <span className="ml-2 border-b border-dashed border-gray-400 inline-block min-w-[200px]">
                _______________________
              </span>
            </div>
            <div>
              <span className="font-semibold">Date of Birth:</span>
              <span className="ml-2 border-b border-dashed border-gray-400 inline-block min-w-[200px]">
                _______________________
              </span>
            </div>
          </div>
        </div>

        {/* Blood Pressure Readings Table */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Blood Pressure Readings
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-2 font-semibold">Date & Time</th>
                <th className="text-center p-2 font-semibold">Systolic<br/>(mmHg)</th>
                <th className="text-center p-2 font-semibold">Diastolic<br/>(mmHg)</th>
                <th className="text-center p-2 font-semibold">Heart Rate<br/>(BPM)</th>
                <th className="text-left p-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {getSortedReadings().map((reading, index) => {
                return (
                  <tr key={reading.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border-b border-gray-200">
                      {format(new Date(reading.timestamp), 'MMM dd, yyyy h:mm a')}
                    </td>
                    <td className="p-2 border-b border-gray-200 text-center font-medium">
                      {reading.systolic}
                    </td>
                    <td className="p-2 border-b border-gray-200 text-center font-medium">
                      {reading.diastolic}
                    </td>
                    <td className="p-2 border-b border-gray-200 text-center">
                      {reading.heartRate}
                    </td>
                    <td className="p-2 border-b border-gray-200 text-sm">
                      {reading.notes || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
          <p>
            Blood Pressure Tracker - This report contains raw data for medical review.
          </p>
        </div>
      </div>
    </div>
  );
};

