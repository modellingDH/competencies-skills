---
id: http_request
name: HTTP Request
type: tool
tags: [network, api, http]
---

## Description
Makes HTTP requests to external APIs or web services with automatic retry logic, timeout handling, and response parsing.

## Parameters

### Input
- **url** (string, required): Target URL
- **method** (string, optional, default: "GET"): HTTP method (GET, POST, PUT, DELETE, PATCH)
- **headers** (object, optional): HTTP headers as key-value pairs
- **body** (string | object, optional): Request body (auto-serialized if object)
- **timeout_ms** (number, optional, default: 30000): Request timeout in milliseconds
- **retry_count** (number, optional, default: 3): Number of retries on failure
- **retry_delay_ms** (number, optional, default: 1000): Delay between retriesin milliseconds

### Output
- **status** (number): HTTP status code
- **body** (string): Response body
- **headers** (object): Response headers
- **success** (boolean): True if status 2xx
- **error** (string | null): Error message if request failed

**Deterministic**: No - Network calls are non-deterministic

## Behavior

**Success Case:**
```typescript
Input: {
  url: "https://api.github.com/users/octocat",
  headers: { "Authorization": "token ghp_xxx" }
}
Output: {
  status: 200,
  body: '{"login":"octocat","id":583231,...}',
  headers: { "content-type": "application/json", ... },
  success: true,
  error: null
}
```

**Rate Limit Case:**
```typescript
Input: { url: "https://api.example.com/data" }
Output: {
  status: 429,
  body: '{"message":"Too many requests"}',
  headers: { "retry-after": "60" },
  success: false,
  error: "Rate limit exceeded, retry after 60 seconds"
}
```

**Timeout Case:**
```typescript
Input: { url: "https://slow-api.com", timeout_ms: 5000 }
Output: {
  status: 0,
  body: null,
  success: false,
  error: "Request timeout after 5000ms"
}
```

## Side Effects
- **Network I/O**: Makes external HTTP requests
- **Retry Logic**: May make multiple requests on failure
- **Rate Limiting**: May wait and retry on 429 responses
- **Logging**: Logs request details and errors

## Security Considerations
- Validates HTTPS for sensitive data
- Never logs authorization headers
- Sanitizes URLs to prevent SSRF attacks
- Respects robot.txt and rate limits

## Error Handling
- Automatic retry with exponential backoff on 5xx errors
- Honours Retry-After header on 429 responses
- Returns structured error for network failures
- Timeout protection prevents hanging requests

## Usage with OAuth (@concept:oauth2)
```javascript
const response = http_request({
  url: "https://api.example.com/protected",
  headers: {
    "Authorization": "Bearer " + access_token,
    "Content-Type": "application/json"
  },
  method: "POST",
  body: { data: "value" }
});
```
