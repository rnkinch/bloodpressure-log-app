# Blood Pressure Tracker

A modern React application for tracking blood pressure, heart rate, and health trends with statistical analysis.

## Features

- 📊 **Data Entry**: Easy-to-use form for logging blood pressure readings, heart rate, and timestamps
- 📈 **Visual Charts**: Interactive charts showing trends over time (week, month, all time)
- 📊 **Statistics**: Comprehensive statistics and blood pressure categorization
- 💾 **Local Database**: All data is stored in a local SQLite database
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git (optional, for cloning)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Start Everything with One Command (Recommended)

**Using npm script:**
```bash
npm run dev
```

**Using shell script:**
```bash
./start.sh
```

This will start both the backend (port 3001) and frontend (port 3000) servers simultaneously.

#### Option 2: Start Services Separately

1. **Start the Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server** (Terminal 2)
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` and automatically open in your browser

3. **Access the Application**
   Navigate to `http://localhost:3000` in your browser

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

### Statistics
1. Click on "Statistics" to see comprehensive stats
2. View averages, ranges, and blood pressure categories
3. Filter by time period (week, month, all time)

## Data Storage

All your data is stored in a local SQLite database located in the `data/` directory at the project root. This means:
- ✅ Your data stays private and secure on your machine
- ✅ No internet connection required
- ✅ Data persists between sessions
- ✅ Database is portable - you can backup the `data/bloodpressure.db` file

## Blood Pressure Categories

The app categorizes your readings based on AHA guidelines:
- **Normal**: < 120/80 mmHg
- **Elevated**: 120-129/< 80 mmHg
- **Stage 1 Hypertension**: 130-139/80-89 mmHg
- **Stage 2 Hypertension**: ≥ 140/90 mmHg

## Technical Details

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Charts**: Recharts library
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: SQLite database in `data/` directory

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

**Root directory:**
- `npm run dev` - Starts both backend and frontend servers simultaneously (recommended)
- `npm start` - Runs only the frontend in development mode on port 3000
- `npm run start:frontend` - Runs only the frontend
- `npm run start:backend` - Runs only the backend
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

**Backend (backend directory):**
- `npm start` - Runs the backend server on port 3001
- `npm run dev` - Runs the backend with nodemon for auto-reload (if installed)

**Shell script:**
- `./start.sh` - Starts both backend and frontend servers (alternative to `npm run dev`)

### Project Structure

```
.
├── backend/            # Backend API server
│   ├── services/       # Business logic services
│   ├── server.js       # Express server and API routes
│   └── package.json    # Backend dependencies
├── src/                # Frontend React application
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (API calls)
│   ├── App.tsx         # Main app component
│   └── index.tsx       # App entry point
├── data/               # SQLite database directory
│   └── bloodpressure.db
├── package.json        # Frontend dependencies
└── README.md           # This file
```

### Database Location

The SQLite database is stored in `data/bloodpressure.db` relative to the project root. You can override this by setting the `BP_DB_PATH` environment variable when starting the backend:

```bash
BP_DB_PATH=/path/to/custom/database.db npm start
```

## License

This project is open source and available under the MIT License.

This project is open source and available under the MIT License.
