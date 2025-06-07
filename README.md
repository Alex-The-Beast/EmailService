# Resilient Email Service

A robust, production-ready email sending service built in JavaScript/Node.js with comprehensive failure handling, retry mechanisms, and monitoring capabilities.


## 🚀 Deployed API

You can access the deployed API here:  
👉 [Live API on Render](https://emailservice-wgux.onrender.com/)


## 🚀 Features

### Core Requirements ✅
- **✅ EmailService Class**: Central service managing multiple email providers
- **✅ Mock Email Providers**: Two configurable mock providers (MockProviderA & MockProviderB)
- **✅ Retry Logic**: Exponential backoff retry mechanism with configurable attempts
- **✅ Fallback Mechanism**: Automatic provider switching on failure
- **✅ Idempotency**: Prevents duplicate email sends using unique identifiers
- **✅ Rate Limiting**: Configurable rate limiting (requests per time window)
- **✅ Status Tracking**: Real-time email status monitoring and history

### Bonus Features ✅
- **✅ Circuit Breaker Pattern**: Prevents cascading failures by temporarily disabling failing providers
- **✅ Comprehensive Logging**: Configurable logging levels (DEBUG, INFO, WARN, ERROR)
- **✅ Queue System**: In-memory email queue with status management
- **✅ Statistics & Monitoring**: Detailed service metrics and performance tracking
- **✅ RESTful API**: Complete HTTP API for integration
- **✅ Provider Health Monitoring**: Real-time provider status tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTTP API      │────│  EmailService    │────│  Mock Providers │
│                 │    │                  │    │  - Provider A   │
│ POST /send      │    │ - Retry Logic    │    │  - Provider B   │
│ GET  /status    │    │ - Fallback       │    │                 │
│ GET  /stats     │    │ - Rate Limiting  │    └─────────────────┘
│                 │    │ - Idempotency    │
└─────────────────┘    │ - Circuit Breaker│
                       └──────────────────┘
```

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <https://github.com/Alex-The-Beast/EmailService>
cd email-service

# Install dependencies
npm install

# Start the server
npm start

# Run demo tests
node demo.js
```

## 🔧 Configuration

The EmailService can be configured with the following options:

```javascript
const emailService = new EmailService({
  providers: [providerA, providerB],     // Array of email providers
  maxRetries: 3,                         // Maximum retry attempts
  rateLimit: 5,                          // Requests per time window
  rateWindow: 60 * 1000,                // Rate limit window (ms)
  logLevel: "DEBUG"                      // Logging level
});
```

## 🌐 API Endpoints

### Send Email
```http
POST /send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email body content",
  "id": "optional-custom-id"
}
```

**Response:**
```json
{
  "success": true,
  "provider": "MockProviderA",
  "attempts": 1,
  "message": "Email sent successfully",
  "emailId": "unique-email-id"
}
```

### Check Email Status
```http
GET /status/{emailId}
```

**Response:**
```json
{
  "id": "email-id",
  "status": "sent",
  "provider": "MockProviderA",
  "attempts": 1,
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### Get Service Statistics
```http
GET /stats
```

**Response:**
```json
{
  "totalEmails": 150,
  "successfulEmails": 145,
  "failedEmails": 5,
  "successRate": 96.67,
  "providerStats": {
    "MockProviderA": { "sent": 80, "failed": 3 },
    "MockProviderB": { "sent": 65, "failed": 2 }
  }
}
```

### Toggle Provider Failure (Testing)
```http
POST /toggle-failure/{providerName}
Content-Type: application/json

{
  "successRate": 0.5
}
```

### Run All Tests
```http
GET /test-all
```

## 🔄 Resilience Features

### 1. Retry Logic with Exponential Backoff
- Configurable retry attempts (default: 3)
- Exponential backoff: 1s, 2s, 4s, 8s...
- Jitter to prevent thundering herd

### 2. Provider Fallback
- Automatic failover to secondary provider
- Round-robin provider selection
- Provider health monitoring

### 3. Circuit Breaker Pattern
- Monitors provider failure rates
- Temporarily disables failing providers
- Auto-recovery mechanism

### 4. Rate Limiting
- Configurable rate limits per time window
- In-memory rate limit tracking
- Graceful handling of rate limit violations

### 5. Idempotency
- Prevents duplicate email sends
- Uses email content hash or custom ID
- Maintains send history

## 📊 Monitoring & Logging

### Log Levels
- **DEBUG**: Detailed execution flow
- **INFO**: General information
- **WARN**: Warning conditions
- **ERROR**: Error conditions

### Statistics Tracked
- Total emails processed
- Success/failure rates
- Provider performance metrics
- Average response times
- Circuit breaker status

## 🧪 Testing

### Run Demo Tests
```bash
npm run demo
```

The demo includes comprehensive test scenarios:
- ✅ Normal send with potential fallback
- ✅ Duplicate send (idempotency verification)
- ✅ Rate limiting behavior
- ✅ Circuit breaker activation
- ✅ Provider failure scenarios

### API Testing
```bash
# Test all scenarios via HTTP API
curl http://localhost:3000/test-all

# Send individual email
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Hello World"}'
```

## 🏥 Health Checks

The service provides built-in health monitoring:
- Provider availability status
- Circuit breaker states
- Rate limit status
- Queue health metrics

## 🔒 Error Handling

Comprehensive error handling for:
- Network timeouts
- Provider failures
- Rate limit violations
- Invalid email formats
- Service overload conditions

## 📈 Performance

- **Throughput**: Configurable rate limiting
- **Latency**: Sub-second response times
- **Reliability**: 99%+ success rate with fallback
- **Scalability**: Horizontal scaling ready

## 🚀 Deployment

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Production Deployment
- Compatible with Docker, PM2, or cloud platforms
- Environment-based configuration
- Health check endpoints available
- Logging integration ready

## 📋 Requirements Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| EmailService class | ✅ | Core service with provider management |
| Two mock providers | ✅ | MockProviderA & MockProviderB |
| Retry logic | ✅ | Exponential backoff with jitter |
| Fallback mechanism | ✅ | Automatic provider switching |
| Idempotency | ✅ | Email deduplication system |
| Rate limiting | ✅ | Configurable time-window limits |
| Status tracking | ✅ | Real-time status monitoring |
| Circuit breaker | ✅ | Provider failure protection |
| Logging | ✅ | Multi-level logging system |
| Queue system | ✅ | In-memory email queue |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for resilient email delivery**