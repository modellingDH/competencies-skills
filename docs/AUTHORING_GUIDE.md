# Skill Authoring Guidelines

This guide outlines the best practices for creating high-quality, reliable Agent Skills in the Cognitive Library. These principles are adapted from Anthropic's "Agent Skills" methodology.

## Core Philosophy

A Skill is not just a script; it is a **package of expertise**. It teaches the agent *how* to think about a specific domain and provides the tools to execute tasks within that domain.
We use a **Router-Centric** design: The most important metadata is what helps the AI Router decide *when* to pick your skill.

---

## 🚀 The "Do's" (Best Practices)

### 1. Optimize for the Router

* **DO** write a `description` that is functional and situation-based. Think: "When would a project manager assign this task?"
  * *Good*: "Diagnoses network connectivity issues using ping, traceroute, and packet analysis tools."
  * *Bad*: "Learn about networking protocols." (This is an objective, not a routing description).
* **DO** use unique, distinctive names for skills (`diagnose_network`, not `fix_computer`).

### 2. Progressive Disclosure (Keep it Lean)

* **DO** keep your main `SKILL.md` (System Prompt) concise. Ideally under 800 lines.
* **DO** offload deep domain knowledge to "Context Files" (Markdown docs) that the agent can read *only if needed*.
  * *Example*: Don't paste the entire PostgreSQL manual into the prompt. Provide a `docs/postgres_cheatsheet.md` context file.

### 3. Use "Canonical Examples" (Few-Shot)

* **DO** provide at least 2-3 "Canonical Examples" in your skill definition.
* **DO** show the *Chain of Thought*. Show how the agent should *reason* before calling a tool.
  * *Structure*: User Input -> Thought Process -> Tool Call -> Observation -> Final Answer.
* **DO** cover happy paths and common edge cases (e.g., tool failure).

### 4. Write Imperative Instructions

* **DO** use active, direct commands.
  * *Good*: "Check the logs for error code 500."
  * *Bad*: "You should please check the logs and see if there is an error code 500."
* **DO** structure complex logic as **Checklists** or **Step-by-Step** protocols.

### 5. Define Clear Failure States

* **DO** tell the agent what to do if it gets stuck. "If `ping` fails, use `traceroute`. If both fail, report a physical link issue."

---

## ❌ The "Do Nots" (Common Pitfalls)

### 1. Don't Overload Context

* **DO NOT** dump entire codebases or 50-page PDFs into the `procedure`. It confuses the model and wastes tokens.
* **DO NOT** include generic "You are a helpful assistant" text. Be specific: "You are a Network Reliability Engineer."

### 2. Don't Be Vague

* **DO NOT** use ambiguous verbs like "Explore" or "Look into" without defining *how*.
  * *Fix*: "Scan the directory for config files ending in `.yaml`."
* **DO NOT** leave tool output interpretation to chance. Define "Interpretation Rules" (e.g., "Exit code 1 means X").

### 6. Defining Concepts (Shared Vocabulary)

Concepts allow multiple skills to share a common understanding of domain terms (e.g., "Critical Failure", "Network Latency").

### Do's

* **Do** map concepts to external ontologies (Wikidata, ESCO) using the `alignment` field.
* **Do** use concepts to define the *meaning* of tool outputs in your `interpretation` rules.

### Don'ts

* **Don't** redefine standard terms if an external definition exists.
* **Don't** use Concepts for active instructions; they are static definitions.

### Example (`concepts/network_latency.md`)

```yaml
---
id: network_latency
name: Network Latency
description: The time it takes for data to travel from source to destination.
alignment:
  - name: Wikidata
    url: https://www.wikidata.org/wiki/Q1163909
---
```

### 3. Don't Neglect Security

* **DO NOT** allow the agent to execute arbitrary code (e.g., `eval()`) unless strictly sandboxed.
* **DO NOT** put secrets or API keys in the prompt or examples.

---

## Skill Structure Schema

Every entity in the library follows this structure:

```markdown
---
name: "Skill Name"
id: "skill_id"
type: "skill"       # or meta-skill, concept, tool, competency
---

## ROLE
You are a [specific practitioner description]...

## OBJECTIVE
[Single, clear, falsifiable statement of what is achieved.]

## BODY

### Step 1: [Action]
1. Do this first...
2. Then do this...

### Step 2: [Decision]
**If X is true** → do Y.
**Otherwise** → do Z.

### Output
Return [description of what the entity produces].
```

For concepts, replace BODY with structured knowledge sections (definitions, rules, tables).
Use standard markdown links to reference other entities: `[Entity Name](/library/type/entity_id)`.
