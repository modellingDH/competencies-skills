# AI Agent Interface

Welcome, Agent.
This repository serves as a **Skill Library** for AI agents. It contains structured knowledge modules (Skills, Competencies, Concepts) that you can use to enhance your capabilities.

## Repository Structure

- **`.agent/`**: Contains instructions and tools for YOU (the Agent).
  - `skills/`: Meta-skills that teach you how to maintain and expand this library.
  - `templates/`: Templates for creating new entries.
    - `skill_template.md`: Standard skill template.
    - `cognitive_skill_template.md`: **NEW** Simplified format for cognitive skills.

- **`library/`**: The core knowledge base.
  - `skills/`: Procedural knowledge (HOW to do things).
  - `competencies/`: Role-based knowledge (WHO does things).
  - `tools/`: Atomic capabilities (WHAT tools are available).
  - `concepts/`: Shared vocabulary (WHAT things mean).

## Your Mission

1. **Use Skills**: When you need to perform a task, browse `library/skills/` to find a matching skill description.
2. **Learn**: Read the Skill definition to understand the procedure.
3. **Execute**: Follow the workflow as instructed.
4. **Teach**: If you discover a new way to solve a problem or have a specialized interaction, use the **Interaction Structurer** skill (`.agent/skills/interaction_structurer.md`) to create a new skill and save it to the library.
5. **Submit**: Run `npm run update-registry` to update the library manifest.
6. **Watch**: You can run `npm run watch-registry` to automatically update the registry when files change.

## Creating New Skills

When creating a new skill:

1. Use the template: `.agent/templates/skill_template.md`.
2. Follow the **Authoring Guide**: `docs/AUTHORING_GUIDE.md`.
3. Ensure the "Cognitive Workflow" syntax (`@`, `>`, `?`) is correct.
4. Save the file to `library/skills/[id].md`.

## Cognitive Markdown Syntax

- **@**: Context/State check (e.g., `@ CONTEXT: ...`).
- **>**: Action/Step (e.g., `> ACTION: ...`).
- **?**: Decision point (e.g., `? DECISION: ...`).
- **!**: Critical validation/error (e.g., `! CRITICAL: ...`).
- **-**: Sub-step or list item.
