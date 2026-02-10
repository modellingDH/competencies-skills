---
id: analyze_log_file
name: Analyze Log File
type: skill
tags: [debugging, monitoring, security]
---

**Description**: Use this skill when you need to extract insights from log files, identify patterns, detect anomalies, or investigate security incidents through log analysis.

# Analysis Strategy

**Objective**: Extract meaningful patterns and anomalies from raw log data to diagnose system health or security status.

## 1. Information Extraction

Scan the log file content to identify structural components and key signals.

- **Log Format**: Determine if it is JSON, Syslog, or Custom format. *Significance: dictating the parsing strategy.*
- **Volume**: check file size. *Significance: Files > 100MB require sampling or streaming to avoid memory exhaustion.*
- **Key Indicators**:
  - Timestamps (Time distribution)
  - Levels (INFO vs ERROR ratios)
  - Sources (Which module is noisy?)

## 2. Assessment

Evaluate the extracted signals to form a diagnosis strategy.

- **If** there is a high frequency of `ERROR` or `CRITICAL` logs, **then** focus on grouping identical stack traces to find the root cause.
- **If** the request involves security auditing, **then** specifically look for:
  - Failed authentication (Brute force?)
  - SQL injection patterns (`@concept:sql_injection`)
- **If** the logs are mostly `INFO` but performance is reported poor, **then** analyze timestamp gaps (latency).

## 3. Execution Plan

1. **Parse**: Use `regex_match` to split lines into structured fields (Timestamp, Level, Message).
2. **Aggregate**: Count occurrences of unique error messages.
3. **Analyze**:
   - Calculate error rates over time.
   - Correlate errors with specific system events.
4. **Report**: Generate a JSON summary including the period covered, total entries, error breakdown, and any critical security alerts found.

# Interpretation Rules

- `regex_match` returns null -> "Log line format mismatch" -> "Try alternative regex pattern"
- High `WARN` count without `ERROR`s -> "Potential degradation" -> "Highlight as early warning in report"
