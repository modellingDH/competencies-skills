---
name: Cognitive Markdown
id: cognitive_markdown
type: concept
---

# Cognitive Markdown

Cognitive Markdown is the document format used to define skills, meta-skills, competencies, and other cognitive entities in the Studio.

## Document Structure

Every Cognitive Markdown document follows this layout:

```yaml
---
name: Human Readable Name
id: snake_case_identifier
type: skill | meta-skill | concept | tool | competency
---
```

Followed by three mandatory sections:

1. **`## ROLE`** — The persona or mindset that executes this entity.
2. **`## OBJECTIVE`** — A single, clear statement of what is achieved.
3. **`## BODY`** — The executable logic or reference content.

## Action Syntax

Within the BODY, use these prefixed constructs:

| Syntax | Purpose | Example |
|--------|---------|---------|
| `> ACTION: VERB` | An executable step | `> ACTION: PARSE the input string` |
| `? DECISION: QUESTION` | A branching point | `? DECISION: Is the document complete?` |
| `| CONTEXT: DATA` | Injected information | `| CONTEXT: The user's current draft` |
| `-> GOTO: LABEL` | Flow control | `-> GOTO: VALIDATION_STEP` |
| `! CRITICAL: WARNING` | A hard constraint | `! CRITICAL: Never overwrite user content` |

## Reference Syntax

Link to other entities using `@type:id` notation:

- `@skill:scaffold_document` — invoke a skill
- `@concept:quality_criteria` — reference knowledge
- `@tool:json_parser` — reference an external tool
- `@meta-skill:evaluative_analysis` — invoke a cognitive procedure

## Formatting Rules

- Use `###` subsections within BODY for multi-step procedures.
- Keep each `> ACTION:` on its own line.
- Use active, imperative voice in all action descriptions.
- One idea per line; prefer lists over paragraphs.
