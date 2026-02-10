---
id: api_rate_limiting
name: API Rate Limiting
type: concept
tags: [api, performance, security, scalability]
---

## Definition
API Rate Limiting is a technique for controlling the number of requests a client can make to an API within a specified time window. It protects backend services from overload, prevents abuse, and ensures fair resource allocation among users.

## Implementation Patterns

### Token Bucket Algorithm
- Tokens added to bucket at fixed rate
- Each request consumes one token
- Request rejected if bucket is empty
- Allows burst traffic up to bucket capacity

### Sliding Window
- Tracks requests in rolling time window
- More accurate than fixed windows
- Prevents boundary gaming attacks

## Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

## Common Limits
- **Public API**: 100 requests/hour
- **Authenticated User**: 1000 requests/hour  
- **Premium Tier**: 10,000 requests/hour
- **Burst Allowance**: Up to 10 requests/second for 5 seconds

## Response Codes
- `429 Too Many Requests` - Rate limit exceeded
- Include `Retry-After` header with seconds to wait

## Benefits
1. **DDoS Protection**: Mitigate denial-of-service attacks
2. **Cost Control**: Prevent unexpected infrastructure costs
3. **Fair Usage**: Ensure all users get equitable access
4. **Service Reliability**: Maintain performance under heavy load

## Related Concepts
- @concept:oauth2 - Different rate limits for different authentication levels
- @concept:sql_injection - Rate limiting slows down brute-force attacks
