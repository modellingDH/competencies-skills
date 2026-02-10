---
id: analyze_log_file
name: Analyze Log File
type: skill
tags: [debugging, monitoring, security]
---

**Description**: Use this skill when you need to extract insights from log files, identify patterns, detect anomalies, or investigate security incidents through log analysis.

# Cognitive Workflow

@ CONTEXT: Check log file format and size
  - VALIDATE: File exists and is readable
  - OBSERVE: Check file size (warn if > 100MB)
  - THOUGHT: Large files may require streaming or sampling

> ACTION: Parse log entries using @tool:regex_match
  - Extract timestamp, level, source, message
  - Handle multiple log formats (JSON, syslog, custom)
  
? DECISION: Are there error patterns to investigate?
  - YES:
    > ACTION: Group errors by type and frequency
    > ACTION: Extract stack traces using @tool:regex_match
    > ACTION: Identify time patterns (e.g., errors spike at night)
  - NO:
    > ACTION: Proceed to general analysis

> ACTION: Generate summary statistics
  - Count entries by log level (INFO, WARN, ERROR, CRITICAL)
  - Identify top error messages
  - Calculate error rate trends

? DECISION: Security-related log analysis?
  - YES:
    > ACTION: Search for suspicious patterns
      - Failed authentication attempts
      - SQL injection indicators (@concept:sql_injection)
      - Unusual access patterns
    ! CRITICAL: If attack detected, escalate immediately
  - NO:
    > ACTION: Focus on performance and errors

> ACTION: Format findings as structured report
  - Use @tool:parse_json to create machine-readable output
  - Include timeline, top issues, recommendations

## Example Output
```json
{
  "period": "2024-01-15 00:00 - 24:00",
  "total_entries": 45203,
  "by_level": {
    "ERROR": 234,
    "WARN": 1205,
    "INFO": 43764
  },
  "top_errors": [
    {"message": "Database timeout", "count": 89},
    {"message": "API rate limit exceeded", "count": 67}
  ],
  "security_alerts": []
}
```

## Required Tools
- @tool:regex_match - Extract patterns from log lines
- @tool:parse_json - Generate structured output
