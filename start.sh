#!/bin/bash
# Start the app. First run will set up the environment automatically.

# Setup if needed
if ! conda env list | grep -q "^hqe "; then
    echo "Setting up environment for the first time..."
    conda create -n hqe python=3.12 -y
    conda run -n hqe pip install -r requirements.txt
    cd src && conda run -n hqe python -m etl.load && cd ..
fi

# Backend
cd src
conda run -n hqe flask --app server.main run --port 3001 &
BACKEND_PID=$!

# Frontend
cd client
if command -v yarn &> /dev/null; then
    yarn && yarn dev &
else
    npm install && npm run dev &
fi
FRONTEND_PID=$!

echo "Backend running on http://localhost:3001"
echo "Frontend running on http://localhost:5173"
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait