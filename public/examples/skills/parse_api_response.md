---
id: parse_api_response
name: Parse API Response
type: skill
tags: [api, integration, data-extraction]
---

**Description**: Use this skill to extract and transform data from API responses, handling errors, pagination, and different response formats.

# Cognitive Workflow

@ CONTEXT: Prepare API call context
  - OBSERVE: Check API endpoint and authentication status
  - OBSERVE: Identify expected response format (JSON, XML, CSV)
  - THOUGHT: APIs may return errors or unexpected formats

> ACTION: Make API request using @tool:http_request
  - Include authentication headers if required (@concept:oauth2)
  - Set appropriate timeout (default: 30 seconds)
  - Handle @concept:api_rate_limiting with retry logic

? DECISION: Was request successful (2xx status)?
  - NO:
    ? DECISION: Is it a rate limit error (429)?
      - YES:
        > ACTION: Wait for Retry-After duration
        > ACTION: Retry request with exponential backoff
      - NO:
        ! CRITICAL: API error, check status code and message
        > ACTION: Log error details
        FAILURE: Return error to caller
  - YES:
    > ACTION: Continue to parse response

> ACTION: Parse response body
  - Use @tool:parse_json for JSON responses
  - Extract relevant fields based on API documentation
  - VALIDATE: Required fields are present

> ACTION: Transform data to expected format
  - Map API field names to internal schema
  - Convert data types if needed
  - Handle null/missing values with defaults

? DECISION: Does API support pagination?
  - YES:
    > ACTION: Check for next_page token or URL
    ? DECISION: Are there more pages to fetch?
      - YES:
        > ACTION: Recursively fetch next page
        > ACTION: Merge results
      - NO:
        > ACTION: Return combined results
  - NO:
    > ACTION: Return single-page results

## Example: GitHub API Response
```json
{
  "items": [
    {"id": 123, "name": "repo1", "stars": 45},
    {"id": 456, "name": "repo2", "stars": 89}
  ],
  "total_count": 2,
  "next_page": null
}
```

## Parsed Output
```json
{
  "repositories": [
    {"repository_id": 123, "repository_name": "repo1", "star_count": 45},
    {"repository_id": 456, "repository_name": "repo2", "star_count": 89}
  ]
}
```

## Required Tools
- @tool:http_request - Make API calls
- @tool:parse_json - Parse JSON responses
