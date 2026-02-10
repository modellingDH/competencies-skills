---
id: regex_match
name: Regex Match
type: tool
tags: [text, pattern-matching, string]
---

## Description
Performs regular expression matching on text, extracting patterns, validating formats, or finding all occurrences of a pattern.

## Parameters

### Input
- **text** (string, required): The text to search
- **pattern** (string, required): Regular expression pattern (JavaScript syntax)
- **flags** (string, optional, default: "g"): Regex flags (g=global, i=case-insensitive, m=multiline)
- **mode** (string, optional, default: "match"): Operation mode
  - `"match"`: Find all matches
  - `"test"`: Test if pattern exists (returns boolean)
  - `"extract"`: Extract named capture groups

### Output
- **matches** (array): Array of matched strings (if mode="match")
- **is_match** (boolean): Whether pattern was found (if mode="test")
- **groups** (object): Named capture groups (if mode="extract")
- **count** (number): Number of matches found

**Deterministic**: Yes

## Behavior

**Match Mode:**
```typescript
Input: {
  text: "Error at 10:23:45 and 14:56:12",
  pattern: "\\d{2}:\\d{2}:\\d{2}",
  flags: "g",
  mode: "match"
}
Output: {
  matches: ["10:23:45", "14:56:12"],
  count: 2
}
```

**Test Mode:**
```typescript
Input: {
  text: "user@example.com",
  pattern: "^[\\w.]+@[\\w.]+\\.[a-z]{2,}$",
  mode: "test"
}
Output: {
  is_match: true
}
```

**Extract Mode (Named Groups):**
```typescript
Input: {
  text: "Price: $49.99",
  pattern: "Price: \\$(?<amount>\\d+\\.\\d{2})",
  mode: "extract"
}
Output: {
  groups: { amount: "49.99" },
  count: 1
}
```

## Common Patterns

### Email Validation
```regex
^[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}$
```

### IP Address
```regex
\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b
```

### Log Timestamp
```regex
\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}
```

### URL Extraction
```regex
https?://[\\w.-]+\\.[a-z]{2,}[^\\s]*
```

## Side Effects
- None (pure function)
- No modifications to input text
- Safe for concurrent use

## Performance Notes
- Complex patterns on large text may be slow
- Use specific patterns instead of greedy wildcards (.*) when possible
- Test patterns on sample data before production use

## Error Handling
- Invalid regex patterns return error with description
- Timeout after 1 second on catastrophic backtracking
- Returns empty matches array if no matches found (not an error)
