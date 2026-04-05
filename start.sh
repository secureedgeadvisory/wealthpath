#!/bin/bash
cd /Users/parthas/Projects/wealthpath
pkill -f "next dev.*5000" 2>/dev/null
sleep 1
npx next dev --port 5000 >> /Users/parthas/Projects/wealthpath/.data/server.log 2>&1
