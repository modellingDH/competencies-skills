---
id: validate_json_schema
name: Validate JSON Schema
type: skill
tags: [data-validation, api, quality]
---

**Description**: Use this skill to verify that JSON data conforms to a defined schema, ensuring data quality and preventing downstream errors in data pipelines or API integrations.

# Cognitive Workflow

@ CONTEXT: Prepare for validation
  - OBSERVE: Check if schema definition is available
  - OBSERVE: Identify JSON data source (file, API response, user input)
  - THOUGHT: Schema validation prevents bad data from propagating

> ACTION: Load JSON schema definition
  - Parse schema using @tool:parse_json
  - VALIDATE: Schema itself is valid JSON Schema format

> ACTION: Load JSON data to validate
  - Parse data using @tool:parse_json
  - Handle parsing errors gracefully

? DECISION: Is data parseable as JSON?
  - NO:
    ! CRITICAL: Data is malformed, cannot proceed
    > ACTION: Return error with line/column of parse failure
  - YES:
    > ACTION: Continue to schema validation

> ACTION: Validate data against schema
  - Check required fields are present
  - Verify data types (string, number, boolean, array, object)
  - Validate format constraints (email, URL, date-time)
  - Check value ranges (min/max for numbers, length for strings)
  - Verify enum values if specified

? DECISION: Does data conform to schema?
  - NO:
    > ACTION: Collect all validation errors
    > ACTION: Format errors with field paths
    EXAMPLE: "Field 'user.email' failed validation: not a valid email format"
    > ACTION: Return structured error report
  - YES:
    > ACTION: Return success with validated data

## Validation Error Format
```json
{
  "valid": false,
  "errors": [
    {
      "path": "user.age",
      "expected": "integer >= 0",
      "actual": -5,
      "message": "Age must be non-negative"
    },
    {
      "path": "user.email",
      "expected": "email format",
      "actual": "not-an-email",
      "message": "Invalid email address"
    }
  ]
}
```

## Required Tools
- @tool:parse_json - Parse schema and data
- @tool:regex_match - Validate string formats (email, URL patterns)
