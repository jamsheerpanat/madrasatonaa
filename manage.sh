#!/bin/bash

# Function to stop services
stop_services() {
    echo "Stopping existing services on ports 8000 and 3000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "Services stopped."
}

# Function to start services
start_services() {
    echo "Starting Backend (Laravel) on port 8000..."
    (cd services/api && php artisan serve --port=8000 > /dev/null 2>&1 &)
    
    echo "Starting Frontend (Next.js) on port 3000..."
    (cd apps/web && npm run dev -- -p 3000)
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac
