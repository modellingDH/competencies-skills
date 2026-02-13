---
name: Entity Types
id: entity_types
type: concept
---

# Entity Types

The Studio library organizes knowledge into five entity types. Each serves a distinct cognitive purpose.

## Meta-Skill

A **reusable cognitive procedure** — a way of thinking that applies across many situations.

- Describes *how* to reason, not *what* to do.
- Is domain-agnostic: the same meta-skill works whether you're writing code, analyzing text, or designing systems.
- Example: evaluating quality, recognizing intent, composing content.
- A meta-skill orchestrates skills; it does not perform specific tasks itself.

## Skill

A **discrete, executable task** with a clear input → output contract.

- Describes *what* to do in concrete, actionable steps.
- Is invoked by meta-skills or directly by users.
- Should be atomic: one skill = one capability.
- Example: validate document structure, generate a skeleton, suggest references.

## Concept

**Declarative knowledge** — definitions, rules, criteria, conventions.

- Is referenced but never "executed."
- Provides the factual grounding that skills and meta-skills rely on.
- Example: what Cognitive Markdown syntax looks like, what quality criteria are.

## Tool

An **external resource or utility** that a skill can invoke.

- Represents something outside the cognitive system: an API, a library, a command.
- Has defined inputs and outputs.
- Example: JSON parser, HTTP client, file system accessor.

## Competency

A **professional role or profile** composed of multiple skills, concepts, and tools.

- Represents a complete capability area.
- Acts as a curated bundle: "a Network Security Analyst *has* these skills, *knows* these concepts, *uses* these tools."
- Example: Data Pipeline Engineer, Technical Writer.

## Classification Guide

When creating a new entity, ask:

| Question | If yes → |
|----------|----------|
| Does it describe a *way of thinking* that applies broadly? | **Meta-Skill** |
| Does it describe a *specific task* with inputs and outputs? | **Skill** |
| Does it define *knowledge or rules* without execution logic? | **Concept** |
| Does it wrap an *external tool or API*? | **Tool** |
| Does it describe a *professional role* with bundled capabilities? | **Competency** |
