# AI Analysis Troubleshooting Guide

## Issue: 500 Internal Server Error

The AI Analysis is returning a 500 error. Here's how to fix it:

### Step 1: Restart the Backend Server

The most likely cause is that the backend server needs to be restarted to pick up the new AI service.

**If using Docker:**
```bash
docker-compose down
docker-compose up --build
```

**If running locally:**
```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
node server.js
```

### Step 2: Test the AI Service

Once the server is restarted, test these endpoints:

1. **Health Check:**
   ```
   GET http://192.168.68.129:3001/api/analysis/health
   ```
   Should return: `{"status":"healthy","service":"AI Analysis Service","timestamp":"..."}`

2. **Debug Test:**
   ```
   GET http://192.168.68.129:3001/api/analysis/debug
   ```
   Should return: `{"status":"success","message":"AI service working","analysis":{...}}`

3. **Main Analysis:**
   ```
   GET http://192.168.68.129:3001/api/analysis/advanced
   ```
   Should return the full AI analysis

### Step 3: Check Server Logs

Look at the backend server console for error messages. You should see:
```
AI Analysis endpoint called
Found X readings
Found X cigar entries, X drink entries
Analysis generated successfully
```

If you see errors, they'll be logged there.

### Step 4: Verify Data

Make sure you have blood pressure readings in your database:

1. Go to the "Add Reading" tab
2. Add at least 2-3 blood pressure readings
3. Try the AI Analysis again

### Step 5: Browser Developer Tools

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to access AI Analysis
4. Look for the failed request and check the response details

### Common Issues & Solutions

#### Issue: "Cannot find module 'ml-regression'"
**Solution:** The AI service has been updated to work without external dependencies. Just restart the server.

#### Issue: "AI Analysis endpoint called" but no further logs
**Solution:** The database might be empty. Add some blood pressure readings first.

#### Issue: "Analysis generated successfully" but frontend shows error
**Solution:** Check the browser console for JavaScript errors in the frontend.

#### Issue: Server won't start
**Solution:** Check if port 3001 is already in use:
```bash
# Find what's using port 3001
netstat -ano | findstr :3001
# Kill the process if needed
taskkill /PID <PID_NUMBER> /F
```

### Step 6: Manual Testing

If the above doesn't work, you can test the AI service directly:

1. Open browser to: `http://192.168.68.129:3001/api/analysis/debug`
2. You should see a JSON response with test analysis
3. If this works, the issue is in the frontend
4. If this fails, the issue is in the backend

### Step 7: Fallback Solution

If the advanced AI analysis still doesn't work, you can temporarily revert to the original analysis:

1. In `src/App.tsx`, change line 251-253 back to:
```tsx
{currentView === 'analysis' && (
  <div className="max-w-4xl mx-auto">
    <AIAnalysis analysis={analysis} />
  </div>
)}
```

This will use the original simple analysis while we debug the advanced one.

### Expected Behavior

When working correctly, the AI Analysis should:

1. **Load immediately** - No long delays
2. **Show 5 tabs** - Overview, Trends, Lifestyle, Predictions, Recommendations
3. **Display real data** - Your actual blood pressure readings and analysis
4. **Show confidence score** - A percentage at the top right
5. **Provide recommendations** - Personalized suggestions based on your data

### Debug Information

If you're still having issues, please provide:

1. **Server logs** - What appears in the backend console
2. **Browser console errors** - Any JavaScript errors
3. **Network tab** - The exact error response from the API
4. **Number of readings** - How many blood pressure readings you have
5. **Server restart** - Whether you've restarted the backend server

### Quick Fix Commands

```bash
# Stop everything
docker-compose down

# Rebuild and start
docker-compose up --build

# Or if running locally:
cd backend
node server.js
```

The AI Analysis should work after restarting the backend server. The service has been completely rewritten to work without external dependencies and includes comprehensive error handling.
