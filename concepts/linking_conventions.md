---
name: Linking Conventions
id: linking_conventions
type: concept
---

# Linking Conventions

Rules for cross-referencing entities in Cognitive Markdown using `@type:id` notation.

## Syntax

References follow the pattern `@type:snake_case_id`:

- `@skill:validate_structure`
- `@concept:quality_criteria`
- `@tool:json_parser`
- `@meta-skill:evaluative_analysis`
- `@competency:network_security_analyst`

## When to Link

| Situation | Action |
|-----------|--------|
| Your skill depends on knowledge defined elsewhere | Add `@concept:` reference |
| Your skill delegates a sub-task to another skill | Add `@skill:` reference |
| Your skill uses an external tool | Add `@tool:` reference |
| Your meta-skill orchestrates other meta-skills | Add `@meta-skill:` reference |
| A concept extends another concept | Add `@concept:` reference |

## When NOT to Link

- Do not link to entities that are only tangentially related.
- Do not link within YAML frontmatter — links belong in BODY content.
- Do not create circular dependencies between skills (A invokes B invokes A).
- Do not reference entities that don't exist yet — create them first or note them as planned.

## Placement

- Place `@references` inline where they are semantically relevant.
- For a list of dependencies, use a dedicated subsection at the end of BODY.
- In evaluation feedback, use references to point the user to relevant concepts or skills.
