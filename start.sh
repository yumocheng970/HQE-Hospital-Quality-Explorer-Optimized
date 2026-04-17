#!/bin/bash
# Start the app. First run will set up the environment automatically.

# Setup if needed
if ! conda env list | grep -q "^hqe "; then
    echo "Setting up environment for the first time..."
    conda create -n hqe python=3.12 -y
    conda run -n hqe pip install -r requirements.txt
    cd src && conda run -n hqe python -m etl.load && cd ..
fi

# Build frontend
echo "Building frontend..."
cd src/client
if command -v yarn &> /dev/null; then
    yarn && yarn build
else
    npm install && npm run build
fi
cd ../..

# Start Flask (serves both API and frontend static files)
echo "Starting server..."
cd src
conda run -n hqe flask --app server.main run --port 3001

echo "App running at http://localhost:3001"