#!/bin/bash
cd /home/z/my-project
NODE_OPTIONS="--max-old-space-size=4096" node_modules/.bin/next dev -p 3000 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for ready
sleep 5

# Test page
echo "Testing page..."
curl -s -o /dev/null -w "Page: %{http_code}\n" http://localhost:3000/
sleep 2

# Test API
echo "Testing config API..."
curl -s http://localhost:3000/api/supabase/config
echo ""

# Check if process still alive
sleep 2
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server is ALIVE after API call"
else
    echo "Server is DEAD after API call"
fi

# Test another page
echo "Testing another page..."
curl -s -o /dev/null -w "Page2: %{http_code}\n" http://localhost:3000/
sleep 2

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server is ALIVE"
else
    echo "Server is DEAD"
fi
