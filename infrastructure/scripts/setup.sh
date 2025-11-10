#!/bin/bash

echo "Setting up Notification System..."

# Copy .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please update .env with your actual credentials"
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build and start infrastructure
echo "Starting infrastructure services (Postgres, Redis, RabbitMQ)..."
docker-compose up -d postgres redis rabbitmq

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 15

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Run 'npm run dev' to start all services"
echo "3. Access RabbitMQ Management: http://localhost:15672 (guest/guest)"
