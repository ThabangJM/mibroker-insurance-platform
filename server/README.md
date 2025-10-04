# MiBroker API Documentation

## Overview
The MiBroker API is a RESTful service that provides insurance quote generation, policy management, user authentication, analytics, and provider information for the MiBroker platform.

## Base URL
- Development: `http://localhost:3001`
- API Base: `http://localhost:3001/api`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Health & Status
- `GET /health` - Health check endpoint
- `GET /api/status` - API status and information

### Authentication & Users (`/api/users`)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile/:userId` - Get user profile (authenticated)
- `PUT /api/users/profile/:userId` - Update user profile (authenticated)
- `POST /api/users/change-password/:userId` - Change user password (authenticated)
- `DELETE /api/users/:userId` - Delete user account (authenticated)
- `GET /api/users/:userId/activity` - Get user activity (admin only)

### Insurance Quotes (`/api/quotes`)
- `POST /api/quotes/generate` - Generate new insurance quotes
- `GET /api/quotes/:quoteId` - Get specific quote by ID
- `PUT /api/quotes/:quoteId/status` - Update quote status
- `GET /api/quotes/user/:userId` - Get user's quotes with pagination
- `POST /api/quotes/compare` - Compare multiple quotes

### Policies (`/api/policies`)
- `GET /api/policies/user/:userId` - Get user's policies
- `GET /api/policies/:policyId` - Get specific policy
- `POST /api/policies` - Create new policy from quote
- `PUT /api/policies/:policyId` - Update policy
- `POST /api/policies/:policyId/cancel` - Cancel policy
- `POST /api/policies/:policyId/renew` - Renew policy
- `GET /api/policies/:policyId/documents` - Get policy documents
- `POST /api/policies/:policyId/documents` - Add policy document
- `GET /api/policies/:policyId/claims` - Get policy claims

### Analytics (`/api/analytics`)
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/quotes` - Quote analytics
- `GET /api/analytics/policies` - Policy analytics
- `GET /api/analytics/users` - User analytics (admin)
- `GET /api/analytics/providers` - Provider performance analytics
- `GET /api/analytics/conversion-funnel` - Conversion funnel data
- `POST /api/analytics/events` - Track user events
- `GET /api/analytics/revenue` - Revenue analytics

### Insurance Providers (`/api/providers`)
- `GET /api/providers` - Get all providers (with filters)
- `GET /api/providers/:providerId` - Get specific provider
- `GET /api/providers/:providerId/availability/:insuranceType` - Check provider availability
- `POST /api/providers/compare` - Compare providers
- `GET /api/providers/:providerId/performance` - Provider performance metrics

## Request Examples

### Generate Quote
```javascript
POST /api/quotes/generate
{
  "userId": "user-id",
  "insuranceType": "auto",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0123456789"
  },
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020
  }
}
```

### User Registration
```javascript
POST /api/users/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0123456789"
}
```

### User Login
```javascript
POST /api/users/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

## Response Format
All API responses follow this format:
```javascript
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": string (on error),
  "timestamp": string (ISO date)
}
```

## Error Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting
- General: 100 requests per 15 minutes per IP
- Authentication: 5 requests per 15 minutes per IP

## Environment Variables
Required environment variables (see `.env` file):
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `API_VERSION` - API version (default: v1)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window
- `RATE_LIMIT_MAX` - Max requests per window

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test
```

## Features
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Request logging
- ✅ Error handling
- ✅ Health checks
- ✅ Mock data for development
- ✅ Comprehensive endpoints for all features
- ✅ Pagination support
- ✅ Filtering and search capabilities

## Future Enhancements
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real insurance provider API integration
- [ ] Email notifications
- [ ] File upload handling
- [ ] Caching layer (Redis)
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Monitoring and logging (Winston)