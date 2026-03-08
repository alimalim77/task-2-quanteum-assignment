#!/bin/bash

# --- Quanteum Property Portal Unified Startup Script ---

PROJECT_ROOT=$(pwd)
LOG_DIR="$PROJECT_ROOT/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "----------------------------------------------------"
echo "🚀 Initializing Quanteum Property Portal services..."
echo "----------------------------------------------------"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port)
    if [ ! -z "$pids" ]; then
        echo "⚠️  Cleaning up port $port (PIDs: $pids)..."
        echo "$pids" | xargs kill -9
    fi
}

# --- 1. Cleanup existing processes ---
echo "Step 1: Cleaning up existing ports..."
kill_port 3000 # Next.js
kill_port 8001 # Python ML
kill_port 8082 # Java Backend
echo "✅ Ports cleared."

# --- 2. Start Python ML API (App 1) ---
echo "Step 2: Starting Python ML API (Port 8001)..."
cd "$PROJECT_ROOT/app1-backend"
# Try uvicorn, fallback if needed
nohup uvicorn main:app --host 0.0.0.0 --port 8001 > "$LOG_DIR/python_api.log" 2>&1 &
echo "✅ Python API starting in background. Log: logs/python_api.log"

# --- 3. Start Java Backend (App 2) ---
echo "Step 3: Starting Java Backend (Port 8082)..."
cd "$PROJECT_ROOT/housing_app"
nohup ./gradlew bootRun > "$LOG_DIR/java_backend.log" 2>&1 &
echo "✅ Java Backend starting in background. Log: logs/java_backend.log"

# --- 4. Start Next.js Frontend ---
echo "Step 4: Starting Next.js Frontend (Port 3000)..."
cd "$PROJECT_ROOT/housing-portal"
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
echo "✅ Frontend starting in background. Log: logs/frontend.log"

echo "----------------------------------------------------"
echo "🎉 All services are firing up!"
echo "----------------------------------------------------"
echo "🌍 Portal:    http://localhost:3000"
echo "🐍 Python API: http://localhost:8001"
echo "☕ Java API:   http://localhost:8082"
echo ""
echo "Note: Full startup (especially Java) may take 10-20 seconds."
echo "Use 'tail -f logs/<log_name>.log' to monitor progress."
echo "----------------------------------------------------"
