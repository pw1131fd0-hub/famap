#!/bin/bash
set -x
cd /home/crawd_user/project/famap/server
python3 -m pip install -r requirements.txt --break-system-packages
cd /home/crawd_user/project/famap
nohup python3 start_server.py > backend.log 2>&1 &
echo $! > backend.pid

cd /home/crawd_user/project/famap/client
npm install --legacy-peer-deps
nohup npm run dev -- --port 3004 --host 0.0.0.0 > ../frontend.log 2>&1 &
echo $! > ../frontend.pid
echo "Deployment started"