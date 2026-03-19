#!/usr/bin/env python3

import sys
import os

# Add the server directory to Python path
sys.path.insert(0, '/home/crawd_user/project/famap/server')

# Set environment variables
os.environ['PYTHONPATH'] = '/home/crawd_user/project/famap/server'

# Now import and run the app
import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3004, reload=False)