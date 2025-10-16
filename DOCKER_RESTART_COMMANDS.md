# Docker Restart Commands for WSL

## Quick Fix for AI Analysis 500 Error

Since you're using Docker with WSL, here are the exact commands to restart your containers and fix the AI Analysis:

### Step 1: Open WSL Terminal
Open your WSL terminal (Ubuntu) and navigate to your project:

```bash
cd /home/rnkin/projects/bloodpressure-log-app
```

### Step 2: Stop Current Containers
```bash
docker-compose down
```

### Step 3: Rebuild and Start Containers
```bash
docker-compose up --build
```

### Step 4: Test the AI Service
Once the containers are running, test the AI service:

1. **Open browser to:** `http://192.168.68.129:3001/api/analysis/debug`
2. **You should see:** A JSON response with test analysis
3. **If successful:** The AI service is working

### Step 5: Try AI Analysis in App
Go back to your blood pressure app and click on the "AI Analysis" tab.

## Alternative Commands (if above doesn't work)

### If you have multiple docker-compose files:
```bash
# List available compose files
ls -la docker-compose*

# Use the specific file
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up --build
```

### Check running containers:
```bash
docker ps
```

### Force remove and rebuild:
```bash
docker-compose down --volumes --remove-orphans
docker-compose up --build --force-recreate
```

## What This Fixes

✅ **Picks up new AI service** - The container will include the updated AI analysis service  
✅ **No external dependencies** - Works with built-in JavaScript functions only  
✅ **Better error handling** - Comprehensive logging and debugging  
✅ **Debug endpoints** - Easy testing of AI functionality  

## Expected Results

After restarting with `--build`, you should see:

1. **Backend logs showing:**
   ```
   Server running on port 3001
   API available at http://localhost:3001/api
   ```

2. **AI Analysis tab working** with:
   - Overview tab with risk assessment
   - Trends tab with statistical analysis
   - Lifestyle tab with correlation analysis
   - Predictions tab with forecasting
   - Recommendations tab with personalized suggestions

3. **Debug endpoint working:** `http://192.168.68.129:3001/api/analysis/debug`

## Troubleshooting

If you still get 500 errors after restart:

1. **Check container logs:**
   ```bash
   docker-compose logs backend
   ```

2. **Test debug endpoint:**
   ```bash
   curl http://192.168.68.129:3001/api/analysis/debug
   ```

3. **Verify containers are running:**
   ```bash
   docker ps
   ```

The AI service has been completely rewritten to work without external dependencies, so it should work immediately after rebuilding the containers.
