# Studio Validation Architecture & Prompts

## Overview

The Studio Editor employs a **Hybrid Validation Pipeline** that combines instant static analysis with asynchronous AI (Gemma-2-2b-it) evaluation. This ensures the editor feels responsive while still providing deep semantic insights.

The validation is **Sequential**: a later stage is only evaluated if the previous stages pass. This guides the user through a logical progression of "maturity" for their competency.

## Validation Stages

### Stage 1: Structure (Static)

**Goal**: Ensure the document is a valid Cognitive Markdown file.
**Evaluation Method**: **Static Regex Analysis**.
**Checks**:

- **Frontmatter**: Must have valid YAML with `name` and `id`.
- **Headers**: Must contain `## ROLE` and `## OBJECTIVE`.
- **Length**: Content must be > 20 words.
- **Gemma Usage**: None for *validation*. Used for the **"Generate Structure"** fix action.

### Stage 2: Content (Static)

**Goal**: Ensure actions are actionable and logic is clear.
**Evaluation Method**: **Static Regex Analysis**.
**Checks**:

- **Action Verbs**: `> ACTION:` items must start with uppercase verbs (e.g., `> ACTION: ANALYZE`).
- **Decision Logic**: `? DECISION:` blocks should imply branching (checked heuristically).
- **Placeholders**: No `TODO` strings remaining.
- **Gemma Usage**: None for *validation*. Used for the **"Revise Content"** fix action.

### Stage 3: Connectivity (Hybrid)

**Goal**: Ensure the competency is well-integrated with the project knowledge graph.
**Evaluation Method**: mixed.

- **Static**: Checks validity of existing links (`@type:id`) against the loaded project state.
- **AI (Gemma)**: Scans for "Orphans" — technical terms that exist in the project but are not linked in the text.
- **Gemma Usage**: Used to detect orphans and for the **"Auto-Link Entities"** fix action.

### Stage 4: Polish (AI)

**Goal**: Ensure professional tone, safety, and conciseness.
**Evaluation Method**: **Pure AI Analysis (Gemma-2-2b-it)**.
**Checks**:

- Tone consistency.
- Presence of guardrails (`! CRITICAL`) for risky actions.
- Conciseness.
- **Gemma Usage**: Used for both *analysis* (scoring) and the **"Polish Content"** fix action.

---

## Prompt Engineering (Gemma-2-2b-it)

We use the **Gemma-2-2b-it** model running locally in the browser via WebLLM. The specific prompts used for each stage are defined in `src/services/verification_prompts.ts`.

### 1. Structure Fix Prompt

**System**:

```text
You are an expert technical editor. Output ONLY the rewritten markdown.
```

**User**:

```text
Refactor the following content to strictly follow the required Studio structure.
Ensure it starts with frontmatter (name, id), followed by '## ROLE' and '## OBJECTIVE'.
Keep the existing information but organize it correctly.

Content:
{content}
```

### 2. Content Fix Prompt

**System**:

```text
You are an expert technical editor. Output ONLY the rewritten markdown.
```

**User**:

```text
Rewrite the following content to improve clarity and formatting.
1. Ensure '> ACTION:' items start with uppercase verbs.
2. Ensure '? DECISION:' blocks display clear logic.
3. Remove 'TODO' placeholders.

Content:
{content}
```

### 3. Connectivity (Auto-Linking) Prompts

**Detection (System)**:

```text
You are a knowledge graph specialist.
Identify "Orphan Concepts" in the text.
An orphan is a specific technical term (Skill, Tool, Concept) that is mentioned by name but NOT linked using the '@type:id' syntax.
Existing known IDs are provided in context.

Output a JSON object:
{
  "orphans": [{"term": "string", "suggested_id": "string", "context": "string"}]
}
```

**Fix (User)**:

```text
Known Entity IDs:
{knownIds}

Rewrite the content below.
Wherever you see a term that matches one of the Known IDs (approximate match), replace it with the correct link syntax: @type:id.
Example: replace "analyze log" with "@skill:analyze_log_file".

Content:
{content}
```

### 4. Polish Prompts

**Analysis (System)**:

```text
You are a Safety and Quality Assurance officer.
Review the content for:
1. Professional, objective tone.
2. Presence of '! CRITICAL:' guardrails for any high-risk actions.
3. Concise descriptions.

Output a JSON object:
{
  "score": number (0-100),
  "suggestions": ["string"],
  "polished_content": "string"
}
```

**Fix (User)**:

```text
Rewrite this content to fix the following issues: {issues_list}

{content}
```
