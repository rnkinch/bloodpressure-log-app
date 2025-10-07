#!/bin/bash

# Blood Pressure Tracker - Management Script

case "$1" in
    "start")
        echo "Starting Blood Pressure Tracker..."
        wsl -d Ubuntu -e bash -c "cd /home/rnkin/projects/bloodpressure-log-app && npm start"
        ;;
    "stop")
        echo "Stopping Blood Pressure Tracker..."
        wsl -d Ubuntu -e bash -c "lsof -ti:3002 | xargs kill -9"
        echo "App stopped."
        ;;
    "restart")
        echo "Restarting Blood Pressure Tracker..."
        wsl -d Ubuntu -e bash -c "lsof -ti:3002 | xargs kill -9"
        sleep 2
        wsl -d Ubuntu -e bash -c "cd /home/rnkin/projects/bloodpressure-log-app && npm start"
        ;;
    "status")
        echo "Checking Blood Pressure Tracker status..."
        wsl -d Ubuntu -e bash -c "lsof -i:3002"
        ;;
    "install")
        echo "Installing dependencies..."
        wsl -d Ubuntu -e bash -c "cd /home/rnkin/projects/bloodpressure-log-app && npm install"
        ;;
    "build")
        echo "Building for production..."
        wsl -d Ubuntu -e bash -c "cd /home/rnkin/projects/bloodpressure-log-app && npm run build"
        ;;
    *)
        echo "Blood Pressure Tracker Management Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|install|build}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the development server"
        echo "  stop     - Stop the development server"
        echo "  restart  - Restart the development server"
        echo "  status   - Check if the server is running"
        echo "  install  - Install dependencies"
        echo "  build    - Build for production"
        echo ""
        echo "The app will be available at:"
        echo "  Local:   http://localhost:3002"
        echo "  Network: http://[YOUR_IP]:3002"
        ;;
esac
