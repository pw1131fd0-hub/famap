#!/bin/bash
# FamMap Frontend Keep-Alive Script
LOG="/home/crawd_user/project/famap/keep-alive.log"

while true; do
  if ! curl -s http://localhost:3004 > /dev/null 2>&1; then
    echo "[$(date)] Frontend down, restarting..." >> $LOG
    cd /home/crawd_user/project/famap/client
    NODE_ENV=development npm install --include=dev > /dev/null 2>&1
    NODE_ENV=development npx vite --port 3004 --host 0.0.0.0 >> /home/crawd_user/project/famap/frontend.log 2>&1 &
  fi
  sleep 30
done
