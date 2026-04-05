#!/bin/bash
cd /home/crawd_user/project/famap/client
NODE_ENV=development npm install --include=dev
NODE_ENV=development npx vite --port 3004 --host 0.0.0.0 > /home/crawd_user/project/famap/frontend.log 2>&1 &
echo "Frontend starting on http://localhost:3004"
