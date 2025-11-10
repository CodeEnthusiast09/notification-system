# infrastructure/scripts/cleanup.sh
#!/bin/bash

echo "Cleaning up..."

docker-compose down -v
rm -rf node_modules
find services -name "node_modules" -type d -exec rm -rf {} +
find services -name "dist" -type d -exec rm -rf {} +
find services -name "__pycache__" -type d -exec rm -rf {} +

echo "Cleanup complete!"
