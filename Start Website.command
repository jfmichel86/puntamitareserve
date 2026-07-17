#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing process on port 3000 so the new server can start clean
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 0.5

echo ""
echo "  ✦ Luxury Rentals Punta Mita — Next.js Preview"
echo "  ─────────────────────────────────────────────"
echo "  Starting up... this can take 10-20 seconds the first time."
echo "  Once ready, Safari will open automatically to:"
echo "  http://localhost:3000/villas"
echo ""
echo "  Keep this window open while browsing."
echo "  Press Ctrl+C to stop."
echo ""

# Open Safari once the server is ready (checks every second, up to 30s)
(
  for i in $(seq 1 30); do
    sleep 1
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      open -a Safari "http://localhost:3000/villas"
      break
    fi
  done
) &

npm run dev
