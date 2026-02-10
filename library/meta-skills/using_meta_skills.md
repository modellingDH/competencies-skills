---
name: Using Meta Skills
type: meta-skill
description: Instructions on how to effectively utilize Meta-Skills to govern, structure, and enhance AI interactions and skill production.
tags: [meta-learning, instruction, governance]
---

# Using Meta Skills

**Objective**: To apply higher-order instructions (Meta-Skills) that govern how other skills are created, organized, or executed.

## Context

Meta-Skills are "skills about skills". They do not perform a direct task (like "parse JSON") but rather dictate the *process* of working with the library itself. They are essential for:

1. **Structuring Interactions**: Turning chaotic chats into reusable artifacts (e.g., `interaction_structurer`).
2. **Governing Production**: Ensuring new skills meet quality standards (e.g., `skill_template`).
3. **Refining Behavior**: Adjusting how an agent interprets standard skills.

## Cognitive Strategy

### 1. specific_meta_skill_selection
>
> Determine which Meta-Skill applies to your current "Management" or "Refinement" task.

* **IF** you are creating a new skill -> **USE** `skill_template` or `cognitive_skill_template`.
* **IF** you are analyzing a conversation to find a skill -> **USE** `interaction_structurer`.
* **IF** you are organizing the library -> **USE** `library_governance` (future).

### 2. meta_application_process
>
> Apply the rules of the Meta-Skill to the target subject.

* **Step 1**: Load the Meta-Skill into your context.
* **Step 2**: Treat the Meta-Skill as the "System Instruction" for the current task.
* **Step 3**: Execute the task (e.g., extraction, authoring) strictly adhering to the Meta-Skill's constraints.

### 3. recursion_check
>
> "Does this process need to be documented?"

* If the way you applied the Meta-Skill was novel or complex, use `interaction_structurer` to capture *that* process as a new Meta-Skill.

## Usage Instructions for Agents

When an agent is asked to "use a meta skill":

1. **Retrieve** the Meta-Skill definition.
2. **Adopt** its "Cognitive Strategy" as your temporary operating procedure.
3. **Process** the target input (e.g., a conversation log, a draft file).
4. **Output** the result (e.g., a new markdown file) in the format specified by the Meta-Skill.
