# Email Service

Microservice responsible for processing and sending email notifications.

## Features

- RabbitMQ message consumer
- SendGrid and SMTP email providers
- Circuit breaker pattern for fault tolerance
- Exponential backoff retry mechanism
- Dead letter queue for failed messages
- Template fetching and variable substitution
- Health check endpoints
- Docker support

## Prerequisites

- Node.js 20+
- RabbitMQ running
- Template Service running
- SendGrid API key OR SMTP credentials

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
# Choose email provider
EMAIL_PROVIDER=sendgrid  # or 'smtp'

# SendGrid (if using)
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMTP (if using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Getting SendGrid API Key

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Go to Settings → API Keys
3. Create API Key with "Mail Send" permissions
4. Copy and add to .env

### Getting Gmail App Password

1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use this password in SMTP_PASSWORD

## Running the Service

### Development
```bash
npm run start:dev
```

### Docker
```bash
docker compose up --build
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "info": {
    "rabbitmq": { "status": "up" },
    "email_provider": { "status": "up" },
    "circuit_breaker": { "status": "closed", "healthy": true }
  }
}
```

### Email Status
```bash
GET /api/email/status
```

## Message Format

The service consumes messages from `email.queue`:

```json
{
  "message_id": "unique-id",
  "notification_type": "email",
  "user_id": "user-123",
  "user_email": "user@example.com",
  "template_id": "welcome_email",
  "language": "en",
  "variables": {
    "name": "John",
    "order_id": "12345"
  },
  "priority": 1,
  "created_at": "2025-11-10T10:00:00Z",
  "retry_count": 0
}
```

## How It Works

1. **Consumes messages** from RabbitMQ `email.queue`
2. **Fetches template** from Template Service
3. **Substitutes variables** in template ({{name}} → John)
4. **Sends email** via SendGrid or SMTP
5. **Handles failures** with retry logic
6. **Moves to DLQ** after max retries

## Retry Strategy

- **Max Retries**: 5 attempts
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s)
- **Jitter**: Random 0-1s added to prevent thundering herd
- **DLQ**: Failed messages after 5 attempts

## Circuit Breaker

Protects against cascading failures:

- **Timeout**: 3 seconds
- **Error Threshold**: 50%
- **Reset Timeout**: 30 seconds

## Testing

### Test Email Sending
```bash
# Send test message to queue (use API Gateway in production)
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "email",
    "user_id": "test-user",
    "template_id": "welcome_email",
    "language": "en",
    "variables": {
      "name": "Test User"
    }
  }'
```

### Check Health
```bash
curl http://localhost:3001/health
```

## Monitoring

### Logs
```bash
# Docker
docker logs -f email-service

# Local
npm run start:dev
```

### Key Metrics to Watch
- Message processing time
- Email delivery success rate
- Circuit breaker status
- Dead letter queue size
- RabbitMQ connection status

## Troubleshooting

### RabbitMQ Connection Failed
- Check RabbitMQ is running: `docker ps`
- Verify connection details in .env
- Check RabbitMQ logs: `docker logs rabbitmq`

### Emails Not Sending
- Verify email provider credentials
- Check circuit breaker status: `GET /api/email/status`
- Review logs for errors
- Test email provider directly

### Template Not Found
- Ensure Template Service is running
- Check TEMPLATE_SERVICE_URL in .env
- Verify template exists in Template Service

## Architecture

```
         ┌─────────────┐
         │  RabbitMQ   │
         │ email.queue │
         └──────┬──────┘
                │
                ▼
┌─────────────────────────────────┐
│      Email Service (NestJS)     │
│                                 │
│  ┌────────────────────────────┐ │
│  │   RabbitMQ Consumer        │ │
│  │   - Receive messages       │ │
│  │   - Retry with backoff     │ │
│  └─────────┬──────────────────┘ │
│            │                    │
│            ▼                    │
│  ┌────────────────────────────┐ │
│  │   Template Service Client  │ │
│  │   - Fetch template         │ │
│  │   - Substitute variables   │ │
│  └─────────┬──────────────────┘ │
│            │                    │
│            ▼                    │
│  ┌────────────────────────────┐ │
│  │   Circuit Breaker          │ │
│  └─────────┬──────────────────┘ │
│            │                    │
│            ▼                    │
│  ┌────────────────────────────┐ │
│  │   Email Provider           │ │
│  │   - SendGrid OR SMTP       │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

## Team
Developed by: [O'Brien]
Technology: NestJS
```
