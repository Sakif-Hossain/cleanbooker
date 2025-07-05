# Cleaning Service CRM & Advertising API Documentation

## Overview

This API serves a web application designed for cleaning service businesses to manage customer relationships, bookings, and advertising campaigns.

## Base URL

```
https://api.cleanbooker.com/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "errors": array | null,
  "meta": {
    "timestamp": "ISO 8601 datetime",
    "requestId": "unique_request_id"
  }
}
```

---

## 1. Authentication Endpoints

### POST /auth/register

Register a new business account

```json
{
  "businessName": "string (required)",
  "ownerName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars)",
  "phone": "string (required)",
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)",
    "country": "string (default: US)"
  },
  "serviceArea": ["string"] // Array of zip codes or city names
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "businessName": "string",
      "email": "string",
      "role": "admin",
      "isVerified": false
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/login

Login to existing account

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### POST /auth/refresh

Refresh access token

```json
{
  "refreshToken": "string (required)"
}
```

### POST /auth/logout

Logout and invalidate tokens

```json
{
  "refreshToken": "string (required)"
}
```

### POST /auth/forgot-password

Request password reset

```json
{
  "email": "string (required)"
}
```

### POST /auth/reset-password

Reset password with token

```json
{
  "token": "string (required)",
  "newPassword": "string (required)"
}
```

---

## 2. User Management

### GET /users/profile

Get current user profile

### PUT /users/profile

Update user profile

```json
{
  "businessName": "string",
  "ownerName": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "serviceArea": ["string"],
  "businessHours": {
    "monday": { "open": "09:00", "close": "17:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "17:00", "closed": false }
    // ... other days
  }
}
```

### POST /users/upload-avatar

Upload business logo/avatar

- Multipart form data with image file

---

## 3. Customer Management (CRM)

### GET /customers

Get customers list with pagination and filters
**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `search`: string (search by name, email, phone)
- `status`: enum (active, inactive, potential)
- `sortBy`: enum (name, email, createdAt, lastService)
- `sortOrder`: enum (asc, desc)

### POST /customers

Create new customer

```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)"
  },
  "propertyType": "enum (house, apartment, office, commercial)",
  "propertySize": "number", // square feet
  "specialInstructions": "string",
  "preferredContactMethod": "enum (email, phone, sms)",
  "status": "enum (potential, active, inactive)"
}
```

### GET /customers/:id

Get customer details

### PUT /customers/:id

Update customer information

### DELETE /customers/:id

Delete customer (soft delete)

### GET /customers/:id/bookings

Get customer's booking history

### GET /customers/:id/notes

Get customer notes

### POST /customers/:id/notes

Add customer note

```json
{
  "content": "string (required)",
  "type": "enum (general, service, complaint, compliment)"
}
```

---

## 4. Services Management

### GET /services

Get available services

### POST /services

Create new service

```json
{
  "name": "string (required)",
  "description": "string",
  "basePrice": "number (required)",
  "duration": "number (required)", // minutes
  "category": "enum (regular, deep, move-in, move-out, commercial)",
  "addOns": [
    {
      "name": "string",
      "price": "number",
      "duration": "number"
    }
  ],
  "isActive": "boolean (default: true)"
}
```

### PUT /services/:id

Update service

### DELETE /services/:id

Delete service

---

## 5. Booking Management

### GET /bookings

Get bookings with filters
**Query Parameters:**

- `page`, `limit`: pagination
- `status`: enum (pending, confirmed, in-progress, completed, cancelled)
- `date`: ISO date (filter by specific date)
- `dateRange`: object { "start": "ISO date", "end": "ISO date" }
- `customerId`: uuid
- `serviceId`: uuid

### POST /bookings

Create new booking

```json
{
  "customerId": "uuid (required)",
  "serviceId": "uuid (required)",
  "scheduledDate": "ISO datetime (required)",
  "estimatedDuration": "number (required)", // minutes
  "address": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)"
  },
  "addOns": ["uuid"], // array of add-on service IDs
  "specialInstructions": "string",
  "totalPrice": "number (required)",
  "paymentMethod": "enum (cash, card, check, online)",
  "recurringType": "enum (none, weekly, biweekly, monthly)",
  "recurringEndDate": "ISO date" // if recurring
}
```

### GET /bookings/:id

Get booking details

### PUT /bookings/:id

Update booking

### PUT /bookings/:id/status

Update booking status

```json
{
  "status": "enum (confirmed, in-progress, completed, cancelled)",
  "notes": "string"
}
```

### POST /bookings/public

Public booking endpoint (for website booking form)

```json
{
  "customer": {
    "firstName": "string (required)",
    "lastName": "string (required)",
    "email": "string (required)",
    "phone": "string (required)",
    "address": {
      "street": "string (required)",
      "city": "string (required)",
      "state": "string (required)",
      "zipCode": "string (required)"
    }
  },
  "serviceId": "uuid (required)",
  "preferredDate": "ISO date (required)",
  "preferredTime": "string (required)", // HH:MM format
  "alternativeDate": "ISO date",
  "alternativeTime": "string",
  "addOns": ["uuid"],
  "specialInstructions": "string",
  "propertyType": "enum (house, apartment, office, commercial)",
  "propertySize": "number",
  "howDidYouHear": "string"
}
```

---

## 6. Calendar & Scheduling

### GET /calendar/availability

Check availability for booking
**Query Parameters:**

- `date`: ISO date (required)
- `serviceId`: uuid (required)
- `duration`: number (required, in minutes)

**Response:**

```json
{
  "success": true,
  "data": {
    "availableSlots": [
      {
        "startTime": "HH:MM",
        "endTime": "HH:MM"
      }
    ]
  }
}
```

### GET /calendar/events

Get calendar events for dashboard
**Query Parameters:**

- `start`: ISO date
- `end`: ISO date

---

## 7. Analytics & Reports

### GET /analytics/dashboard

Get dashboard analytics

```json
{
  "period": "enum (today, week, month, quarter, year, custom)",
  "startDate": "ISO date", // required if period is custom
  "endDate": "ISO date" // required if period is custom
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": "number",
    "totalBookings": "number",
    "completedServices": "number",
    "newCustomers": "number",
    "customerRetentionRate": "number",
    "averageBookingValue": "number",
    "popularServices": [
      {
        "serviceId": "uuid",
        "serviceName": "string",
        "bookingCount": "number",
        "revenue": "number"
      }
    ],
    "revenueByMonth": [
      {
        "month": "YYYY-MM",
        "revenue": "number",
        "bookings": "number"
      }
    ],
    "bookingStatusBreakdown": {
      "pending": "number",
      "confirmed": "number",
      "completed": "number",
      "cancelled": "number"
    }
  }
}
```

### GET /analytics/revenue

Get detailed revenue analytics

### GET /analytics/customers

Get customer analytics

### GET /analytics/services

Get service performance analytics

---

## 8. Marketing & Advertising

### GET /marketing/campaigns

Get advertising campaigns

### POST /marketing/campaigns

Create new campaign

```json
{
  "name": "string (required)",
  "type": "enum (google-ads, facebook, email, sms)",
  "budget": "number",
  "startDate": "ISO date (required)",
  "endDate": "ISO date",
  "targetAudience": {
    "ageRange": { "min": "number", "max": "number" },
    "locations": ["string"],
    "interests": ["string"]
  },
  "adContent": {
    "headline": "string",
    "description": "string",
    "imageUrl": "string",
    "callToAction": "string"
  },
  "isActive": "boolean"
}
```

### GET /marketing/leads

Get marketing leads

### POST /marketing/leads

Convert lead to customer

```json
{
  "leadId": "uuid (required)",
  "customerId": "uuid (required)"
}
```

---

## 9. Notifications

### GET /notifications

Get user notifications

### PUT /notifications/:id/read

Mark notification as read

### POST /notifications/preferences

Update notification preferences

```json
{
  "emailNotifications": {
    "newBookings": "boolean",
    "cancellations": "boolean",
    "payments": "boolean",
    "reviews": "boolean"
  },
  "smsNotifications": {
    "appointmentReminders": "boolean",
    "statusUpdates": "boolean"
  },
  "pushNotifications": {
    "enabled": "boolean"
  }
}
```

---

## 10. Reviews & Feedback

### GET /reviews

Get customer reviews

### POST /reviews/request

Send review request to customer

```json
{
  "bookingId": "uuid (required)",
  "customerId": "uuid (required)"
}
```

---

## 11. Integration Endpoints

### POST /integrations/google-calendar

Connect Google Calendar integration

### POST /integrations/quickbooks

Connect QuickBooks integration

### GET /integrations/status

Get integration status

---

## Error Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 400  | Bad Request - Invalid request data       |
| 401  | Unauthorized - Invalid or missing token  |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource not found           |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation errors |
| 429  | Too Many Requests - Rate limit exceeded  |
| 500  | Internal Server Error                    |

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for public endpoints
- 1000 requests per hour for dashboard analytics

## Webhooks

Configure webhooks to receive real-time updates:

- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `payment.completed`
- `review.received`

## Suggested Improvements

### 1. Advanced Features

- **AI-powered scheduling optimization**: Suggest optimal routes and time slots
- **Automated customer segmentation**: Group customers by behavior, value, etc.
- **Dynamic pricing**: Adjust prices based on demand, location, time
- **Inventory management**: Track cleaning supplies and equipment
- **Employee management**: Schedule staff, track performance
- **Multi-location support**: Manage multiple business locations

### 2. Enhanced Customer Experience

- **Real-time tracking**: GPS tracking of cleaning teams
- **Photo documentation**: Before/after service photos
- **Customer portal**: Self-service booking management
- **Loyalty program**: Points, rewards, referral bonuses
- **Service customization**: Detailed cleaning checklists

### 3. Business Intelligence

- **Predictive analytics**: Forecast demand and revenue
- **Customer lifetime value**: Calculate CLV for better decisions
- **Churn prediction**: Identify at-risk customers
- **Market analysis**: Local competition and pricing insights

### 4. Technical Enhancements

- **Real-time notifications**: WebSocket support for live updates
- **Offline support**: PWA capabilities for field workers
- **API versioning**: Support multiple API versions
- **GraphQL endpoint**: Alternative to REST for complex queries
- **Bulk operations**: Import/export customers, bulk updates

### 5. Integrations

- **Payment processing**: Stripe, Square, PayPal
- **SMS service**: Twilio for customer communications
- **Email marketing**: Mailchimp, Constant Contact
- **Accounting**: QuickBooks, Xero integration
- **Background checks**: For employee verification
- **Insurance**: Liability and bonding verification

### 6. Security & Compliance

- **Two-factor authentication**: Enhanced security
- **GDPR compliance**: Data privacy controls
- **PCI compliance**: Secure payment handling
- **Audit logs**: Track all system changes
- **Role-based permissions**: Granular access control
