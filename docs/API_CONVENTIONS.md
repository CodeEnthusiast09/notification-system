<!-- docs/API_CONVENTIONS.md -->

# API Conventions

## Naming Conventions

- All JSON keys: `snake_case`
- URLs: lowercase with hyphens `/api/user-preferences`
- Environment variables: `UPPER_SNAKE_CASE`

## Response Format

All services MUST return this format:

````json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "message": string,
  "meta": {
    "total": number,
    "limit": number,
    "page": number,
    "total_pages": number,
    "has_next": boolean,
    "has_previous": boolean
  }
}
```

## HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Endpoints

### API Gateway

- POST `/api/notifications/send`
- GET `/api/notifications/:id/status`

### User Service

- POST `/api/users/register`
- POST `/api/users/login`
- GET `/api/users/:id`
- GET `/api/users/:id/preferences`
- PUT `/api/users/:id/preferences`

### Template Service

- GET `/api/templates`
- GET `/api/templates/:id`
- POST `/api/templates`
- PUT `/api/templates/:id`

## Queue Message Format

```json
{
  "message_id": "uuid",
  "notification_type": "email" | "push",
  "user_id": "string",
  "template_id": "string",
  "language": "en",
  "variables": {},
  "priority": 1,
  "created_at": "ISO8601",
  "retry_count": 0
}
````

## Status Codes

- `queued`: Message in queue
- `processing`: Being processed
- `sent`: Successfully sent
- `failed`: Permanently failed
- `retrying`: Being retried
