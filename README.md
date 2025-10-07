# Blood Pressure Tracker

A modern React application for tracking blood pressure, heart rate, and health trends with AI-powered analysis.

## Features

- 📊 **Data Entry**: Easy-to-use form for logging blood pressure readings, heart rate, and timestamps
- 📈 **Visual Charts**: Interactive charts showing trends over time (week, month, all time)
- 🤖 **AI Analysis**: Intelligent trend analysis with health insights and recommendations
- 📊 **Statistics**: Comprehensive statistics and blood pressure categorization
- 💾 **Local Storage**: All data is stored locally in your browser
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Open Your Browser**
   Navigate to `http://localhost:3001` (configured to run on port 3001)

## Usage

### Adding Readings
1. Click on "Add Reading" in the navigation
2. Enter your systolic pressure, diastolic pressure, and heart rate
3. Set the date and time (defaults to current time)
4. Add optional notes
5. Click "Add Reading" to save

### Viewing Trends
1. Click on "Charts" to see visual trends
2. Use the period selector (Week/Month/All) to filter data
3. Hover over data points for detailed information

### AI Analysis
1. Click on "AI Analysis" to see intelligent insights
2. View trend analysis for systolic, diastolic, and heart rate
3. Read personalized recommendations based on your data

### Statistics
1. Click on "Statistics" to see comprehensive stats
2. View averages, ranges, and blood pressure categories
3. Filter by time period (week, month, all time)

## Data Storage

All your data is stored locally in your browser's localStorage. This means:
- ✅ Your data stays private and secure
- ✅ No internet connection required after initial load
- ✅ Data persists between browser sessions
- ⚠️ Data is tied to this specific browser/device

## Blood Pressure Categories

The app categorizes your readings based on AHA guidelines:
- **Normal**: < 120/80 mmHg
- **Elevated**: 120-129/< 80 mmHg
- **Stage 1 Hypertension**: 130-139/80-89 mmHg
- **Stage 2 Hypertension**: ≥ 140/90 mmHg

## AI Analysis Features

The AI analysis provides:
- **Trend Detection**: Identifies increasing, decreasing, or stable trends
- **Risk Assessment**: Low, moderate, or high risk categorization
- **Health Insights**: Personalized observations about your readings
- **Recommendations**: Actionable advice based on your data patterns

## Technical Details

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts library
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: Browser localStorage

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Privacy & Security

- All data is stored locally in your browser
- No data is sent to external servers
- No tracking or analytics
- Your health data remains completely private

## Disclaimer

This application is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical decisions and treatment.

## Development

### Available Scripts

- `npm start` - Runs the app in development mode on port 3001
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

### Project Structure

```
src/
├── components/          # React components
│   ├── BloodPressureForm.tsx
│   ├── BloodPressureChart.tsx
│   ├── AIAnalysis.tsx
│   └── BloodPressureStats.tsx
├── hooks/              # Custom React hooks
│   └── useBloodPressureData.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.ts
│   └── analysis.ts
├── App.tsx             # Main app component
├── App.css             # App-specific styles
├── index.tsx           # App entry point
└── index.css           # Global styles
```

## License

This project is open source and available under the MIT License.
