---
id: skill_id
name: Skill Name
description: Concise, router-facing description of when to use this skill.
required_tools: []
required_context: []
---

# Instructional Context

**Objective**: [What is the pedagogical goal?]
**Role**: [Who is the agent acting as?]

# Cognitive Workflow

@ CONTEXT: [Initial check of state/inputs]
  - VALIDATE: [Pre-conditions]
  - THOUGHT: [Reasoning path]

> ACTION: [First major step]
  - [Sub-step]
  - [Sub-step]

? DECISION: [Branching logic]
  - YES:
    > ACTION: [Path A]
  - NO:
    > ACTION: [Path B]

> ACTION: [Final step/Output generation]

# Interpretation Rules
- @tool:tool_name["error"] -> "Meaning of error" -> "Instruction on how to handle"

# Examples

## Example 1: [Scenario Name]
**User Input**: "..."
**Thought Process**: "..."
**Tool Calls**: [...]
**Final Response**: "..."
