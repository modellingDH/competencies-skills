---
name: Quality Criteria
id: quality_criteria
type: concept
---

# Quality Criteria

A document is considered **ready** when it satisfies all of the following criteria. This checklist is used by `@meta-skill:evaluative_analysis` and `@meta-skill:co_authoring` to assess document maturity.

## Readiness Checklist

### 1. Coherent

The ROLE, OBJECTIVE, and BODY are logically aligned. The role makes sense for the objective, and the body delivers on the objective.

- The persona in ROLE is the right one to execute the BODY.
- The OBJECTIVE accurately summarizes what the BODY achieves.
- There are no contradictions between sections.

### 2. Complete

All mandatory sections are present and substantively filled.

- YAML frontmatter with `name`, `id`, and `type`.
- `## ROLE` is more than a title — it describes a mindset.
- `## OBJECTIVE` is a single, falsifiable statement.
- `## BODY` contains executable or reference content (not just placeholders).

### 3. Sound

The content matches the definition of its declared type (see `@concept:entity_types`).

- A meta-skill describes a cognitive procedure, not a specific task.
- A skill describes an executable task, not abstract reasoning.
- A concept provides definitions, not instructions.

### 4. Classified

The entity type is appropriate for the content.

- If the document describes *how to think* → it should be a meta-skill.
- If it describes *what to do* → it should be a skill.
- If it defines *knowledge* → it should be a concept.
- Gemma should suggest reclassification when the content doesn't match the type.

### 5. Linked

The document references relevant library entities where appropriate.

- Uses `@concept:` references for knowledge it depends on.
- Uses `@skill:` references for sub-tasks it invokes.
- Uses `@tool:` references for external utilities.
- Does not over-link — only meaningful connections.

### 6. Atomic

The document focuses on a single capability or idea.

- A skill does one thing. If it does two, it should be split via `@skill:decompose_skill`.
- A concept covers one topic. Related but distinct topics get separate concepts.

### 7. Actionable

The BODY uses executable syntax where appropriate.

- Skills and meta-skills use `> ACTION:` for steps.
- Decision points use `? DECISION:` with clear branches.
- Context dependencies are explicit with `| CONTEXT:`.
- Passive descriptions are avoided in favor of imperative instructions.

### 8. Formatted

The document follows Cognitive Markdown conventions (see `@concept:cognitive_markdown`).

- YAML frontmatter is valid.
- Sections use correct heading levels.
- Action syntax is on its own line with correct prefixes.
- Content uses active voice and imperative mood.

## Maturity Levels

| Level | Description | Criteria met |
|-------|------------|-------------|
| **Draft** | Has structure, content is incomplete | 1-3 criteria |
| **Review** | Content is present, needs refinement | 4-6 criteria |
| **Ready** | Meets all criteria, suitable for library | All 8 criteria |
