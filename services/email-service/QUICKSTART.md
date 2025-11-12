# Email Service - Quick Start

## Step 1: Setup Environment

```bash
cd services/email-service
cp .env.example .env
```

Edit `.env` and add your email credentials.

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start Dependencies

Make sure these are running:
- RabbitMQ on port 5672
- Template Service on port 3004

```bash
# From project root
docker compose up -d rabbitmq
cd services/template-service && python main.py
```

## Step 4: Run Email Service

```bash
npm run start:dev
```

## Step 5: Test

```bash
# Check health
curl http://localhost:3001/health

# Check email provider status
curl http://localhost:3001/api/email/status
```

## Step 6: Send Test Email

Use API Gateway to send a notification

## Common Issues

**Issue: Can't connect to RabbitMQ**
- Check RabbitMQ is running: `docker ps | grep rabbitmq`
- Check connection in .env

**Issue: Template Service not found**
- Ensure Template Service is running
- Check TEMPLATE_SERVICE_URL in .env

**Issue: Email not sending**
- Verify email provider credentials
- Check logs for errors
```
