#!/bin/bash

echo "========================================="
echo "  AI Virtual Showroom Builder"
echo "  Starting Application..."
echo "========================================="

# Load environment
set -a
source .env 2>/dev/null
set +a

SERVER_PORT=${SERVER_PORT:-3001}
CLIENT_PORT=${CLIENT_PORT:-5173}

# Kill processes on our ports
echo ""
echo "🔧 Cleaning up ports $SERVER_PORT and $CLIENT_PORT..."
lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null
lsof -ti:$CLIENT_PORT | xargs kill -9 2>/dev/null
sleep 1
echo "✅ Ports cleared"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent 2>&1 | tail -1
cd client && npm install --silent 2>&1 | tail -1
cd ..
echo "✅ Dependencies installed"

# Setup database
echo ""
echo "🗄️  Setting up database..."
DB_NAME=${DB_NAME:-ai_showroom}
DB_USER=${DB_USER:-postgres}

# Create database if not exists
psql -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
  createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null

if [ $? -ne 0 ]; then
  echo "⚠️  Could not create database. Trying with current user..."
  psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
    createdb "$DB_NAME" 2>/dev/null
fi

echo "✅ Database ready"

# Seed data
echo ""
echo "🌱 Seeding database..."
node server/seed.js
echo ""

# Start servers with hot reload
echo "========================================="
echo "  🚀 Starting servers..."
echo "  Backend:  http://localhost:$SERVER_PORT"
echo "  Frontend: http://localhost:$CLIENT_PORT"
echo "  Login:    admin@showroom.com / admin123"
echo "========================================="
echo ""

# Start backend with --watch for auto-reload
node --watch server/index.js &
BACKEND_PID=$!

# Start frontend with Vite HMR
cd client && npm run dev &
FRONTEND_PID=$!

# Handle shutdown
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null
  lsof -ti:$CLIENT_PORT | xargs kill -9 2>/dev/null
  echo "✅ Application stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
