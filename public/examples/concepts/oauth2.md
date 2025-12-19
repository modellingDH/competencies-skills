---
id: oauth2
name: OAuth 2.0
type: concept
tags: [authentication, security, api, protocol]
external_ref: https://www.wikidata.org/wiki/Q283889
---

## Definition
OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. It works by delegating user authentication to the service that hosts the user account and authorizing third-party applications to access that account.

## Alignment
**External Reference**: [Wikidata Q283889](https://www.wikidata.org/wiki/Q283889)  
**Specification**: [RFC 6749](https://tools.ietf.org/html/rfc6749)  
**Standard**: IETF OAuth Working Group

## Grant Types

### Authorization Code Flow
```
1. Client redirects user to authorization server
2. User authenticates and approves access
3. Authorization server redirects back with code
4. Client exchanges code for access token
5. Client uses token to access protected resources
```

### Client Credentials Flow
Used for machine-to-machine authentication without user involvement.

## Key Components
- **Resource Owner**: The user who authorizes access
- **Client**: The application requesting access
- **Authorization Server**: Issues tokens after authentication
- **Resource Server**: Hosts protected resources, validates tokens

## Security Best Practices
- Always use HTTPS for token transmission
- Implement token expiration and refresh mechanisms
- Store client secrets securely (never in client-side code)
- Validate redirect URIs to prevent authorization code interception
- Use PKCE (Proof Key for Code Exchange) for mobile/SPA apps

## Related Concepts
- @concept:api_rate_limiting - Protect OAuth endpoints from abuse
- @concept:sql_injection - OAuth can reduce attack surface by centralizing authentication
