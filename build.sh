#!/usr/bin/env bash
set -o errexit

echo "=== Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Building frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Build complete ==="
