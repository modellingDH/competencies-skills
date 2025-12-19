---
id: parse_json
name: Parse JSON
type: tool
tags: [data, parsing, json]
---

## Description
Parses a JSON string into a structured object, with comprehensive error handling for malformed input.

## Parameters

### Input
- **json_string** (string, required): The JSON string to parse
- **strict_mode** (boolean, optional, default: true): If false, attempt to fix common JSON errors

### Output
- **data** (object): The parsed JSON object
- **error** (string | null): Error message if parsing failed, null if successful
- **error_location** (object | null): Line and column of parse error if applicable

**Deterministic**: Yes - Same input always produces same output

## Behavior

**Success Case:**
```typescript
Input: '{"name": "Alice", "age": 30}'
Output: {
  data: { name: "Alice", age: 30 },
  error: null,
  error_location: null
}
```

**Error Case:**
```typescript
Input: '{"name": "Alice", age: 30}'  // Missing quote
Output: {
  data: null,
  error: "Unexpected identifier at line 1, column 19",
  error_location: { line: 1, column: 19 }
}
```

**Non-Strict Mode** (attempts to fix common issues):
- Single quotes → double quotes
- Trailing commas → removed
- Unquoted keys → quoted

## Side Effects
- None (pure function)
- No file I/O, network calls, or state modification
- Safe to call repeatedly

## Error Handling
- Returns structured error instead of throwing exceptions
- Preserves original input in error messages for debugging
- Provides precise error location for quick fixes

## Usage Example
```javascript
const result = parse_json('{"user": {"id": 123, "active": true}}');
if (result.error) {
  console.error(`JSON Parse Error: ${result.error}`);
  console.error(`Location: Line ${result.error_location.line}, Column ${result.error_location.column}`);
} else {
  console.log(`User ID: ${result.data.user.id}`);
}
```
