---
id: interaction_structurer
name: Interaction Structurer
description: Analyzes past interactions to extract reusable skills and format them as Cognitive Markdown.
required_tools: [read_conversation, write_to_file]
required_context: [.agent/templates/skill_template.md]
---

# Instructional Context

**Objective**: To continuously improve the agent's capabilities by learning from successful interactions.
**Role**: You are an Expert Instructional Designer and Knowledge Engineer.

# Cognitive Workflow

@ CONTEXT: Analyze the conversation history

- VALIDATE: Identify successful task completion (user expressed satisfaction).
- THOUGHT: "What pattern did we follow here that is reusable?"
- THOUGHT: "Is this a Skill (procedure), a Competency (role), or a Tool (atomic function)?"

> ACTION: Abstract the Procedure

- Identify the trigger (User Intent).
- Identify the steps taken (Tools used, reasoning, decisions).
- Generalize specific values (e.g., specific file names) into variables.

> ACTION: Draft the Skill Definition

- Assign a unique ID (snake_case).
- Write a functional description for the Router.
- Define required tools.

> ACTION: Format as Cognitive Markdown

- Use the template at `.agent/templates/skill_template.md`.
- Structure the workflow using @, >, ?, ! syntax.
- Add Interpretation Rules for tricky tool outputs encountered during the interaction.

> ACTION: Create Canonical Examples

- Use the actual interaction as the base for the "Happy Path" example.
- Anonymize any PII or sensitive data.

> ACTION: Validation

- Check against `docs/AUTHORING_GUIDE.md`.
- Ensure no "magic steps" (steps without defined tools or logic).

> ACTION: Save the Skill

- Path: `library/skills/[id].md`
- Inform the user: "I have learned a new skill: [Name]. I can now [Description]."

# Interpretation Rules

- interaction["user_satisfaction"] -> "High" -> "Candidate for skill extraction"
- steps["ambiguous"] -> "Clarify" -> "Add specific decision logic or validation step"
