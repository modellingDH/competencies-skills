---
id: sql_injection
name: SQL Injection
type: concept
tags: [security, vulnerability, web-security]
external_ref: https://www.wikidata.org/wiki/Q634169
---

## Definition
SQL Injection is a code injection technique that exploits security vulnerabilities in database-driven applications. Attackers insert malicious SQL statements into input fields, potentially gaining unauthorized access to data, modifying database content, or executing administrative operations.

## Attack Pattern
```sql
-- Malicious input: ' OR '1'='1
-- Results in query: SELECT * FROM users WHERE username = '' OR '1'='1' AND password = ''
-- This always evaluates to true, bypassing authentication
```

## Alignment
**External Reference**: [Wikidata Q634169](https://www.wikidata.org/wiki/Q634169)  
**CVE Category**: CWE-89: Improper Neutralization of Special Elements used in an SQL Command

## Prevention Strategies
1. **Parameterized Queries**: Use prepared statements with bound parameters
2. **Input Validation**: Sanitize and validate all user inputs
3. **Least Privilege**: Database accounts should have minimal necessary permissions
4. **WAF Rules**: Deploy Web Application Firewall with SQL injection signatures

## Related Concepts
- @concept:oauth2 - Secure authentication reduces injection attack surface
- @concept:api_rate_limiting - Limit attempts to probe for vulnerabilities

## Detection Indicators
- Unusual SQL keywords in input fields (`UNION`, `SELECT`, `DROP`)
- Single quotes or SQL comments (`--`, `/*`) in parameters
- Abnormal database query patterns or execution times
