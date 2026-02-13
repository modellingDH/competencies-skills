# Proposal: Background Validation & Contextual AI Progression

## Overview

This proposal details an integrated validation system that runs continuously in the background, guiding the user through the document lifecycle via subtle visual cues ("Validation Bar") and progressively revealed AI actions ("Smart Actions"). The goal is to avoid overwhelming the user while providing targeted assistance exactly when needed.

## 1. The Validation Bar (Visual Status)

A **thin vertical bar** (2-4px wide) attached to the left or right edge of the editor (distinct from the scrollbar).

- **Appearance**:
  - **Segmented**: The bar is divided into logical "stages" (e.g., Structure, Content, Entities, Refinement).
  - **Color-Coded**:
    - **Gray**: Pending / Not started.
    - **Yellow**: In progress / Issues found.
    - **Green**: Validated / Complete.
    - **Blue Pulse**: AI Analyzing.
  - **Checkmarks**: Tiny icons appear on completed segments.
- **Interaction**:
  - **Hover**: Shows a tooltip summary ("Structure: 2 sections missing").
  - **Click**: Expands the "Validation Report" panel (overlay) with detailed checklist and AI insights.

## 2. Validation Stages & Progressive AI Actions

The system tracks the document's maturity across these 4 stages. AI actions are unlocking *only* when relevant to the current stage.

### Stage 1: Structure & Foundation

**Validation Checks**:

- Does the document follow the template (e.g., `## ROLE`, `## OBJECTIVE`)?
- Are required headers present?
- Is the content length sufficient (> 50 words)?

**Contextual AI Actions**:

- **"Generate Skeleton"**: If document is empty.
- **"Fix Structure"**: If headers are missing or malformed.
- *Hidden Actions*: "Refine Tone", "Check Links" (too early).

### Stage 2: Content & Clarity

**Validation Checks**:

- Are `> ACTION:` items starting with verbs?
- Are `? DECISION:` blocks complete (YES/NO branches)?
- Is passive voice used excessively?
- Is the language ambiguous ("do the thing")?

**Contextual AI Actions**:

- **"Clarify Instructions"**: Rewrite ambiguous actions.
- **"Complete Decision Logic"**: Suggest missing branches.
- **"Expand Description"**: If sections are too brief.

### Stage 3: Connectivity (Entities)

**Validation Checks**:

- Are key terms (Skills, Tools) linked (`@tool:python`)?
- Do all links point to existing entities?
- Are there "orphan" concepts (mentioned but not linked)?

**Contextual AI Actions**:

- **"Auto-Link Entities"**: Intelligent find-and-replace for detected project terms.
- **"Extract Concept"**: Create a definition for a repeated term.
- **"Validate References"**: Fix broken links.

### Stage 4: Polish & Finalization

**Validation Checks**:

- Are there any "TODO" placeholders left?
- Is the tone consistent?
- Are there guardrails (`! CRITICAL`) defined for risky actions?

**Contextual AI Actions**:

- **"Clean Up"**: Remove conversational filler, format list spacing, standardize capitalization.
- **"Add Guardrails"**: Suggest safety checks based on actions.
- **"Summarize"**: Generate a description metadata field.

## 3. Intelligent Action Behavior

- **Debounce & Relevance**: Actions are re-evaluated only after significant changes (e.g., stopping typing for 2s, or changing focus).
- **One-at-a-Time**: Only the *highest priority* action is "promoted" (glowing button). Others are available in the "Assistant" menu.
- **No Repetition**: If user ignores "Auto-Link", don't show it again immediately unless new unlinked terms appear.

## 4. Implementation Plan

### A. Data Model (`ValidationState`)

```typescript
interface ValidationState {
    structure: { valid: boolean, errors: string[] };
    content: { valid: boolean, warnings: string[] };
    links: { valid: boolean, missing: string[], broken: string[] };
    polish: { score: number, suggestions: string[] };
}
```

### B. UI Component (`ValidationSidebar`)

A new React component overlaying the Monaco Editor container.

- Rendered absolute positioned on the right edge.
- Connects to `useStudioIntelligence` to get real-time status.

### C. Enhanced `useStudioIntelligence`

- Updates to run checks sequentially (Stage 1 -> Stage 2 -> ...).
- Returns `suggestedAction` (the single best AI action).
- Returns `validationState` for the UI.

### D. The "Clean Up" Action

A dedicated AI Prompt: "Review the document for formatting, consistency, and professional tone. Remove any placeholders or comments. Standardize markdown syntax."
Output: Diff or completely rewritten text.

## 5. User Journey Example

1. **User**: Pastes rough notes.
2. **Bar**: "Structure" segment turns Yellow.
3. **Action**: AI suggests **"Apply Standard Template"**. User accepts.
4. **Bar**: "Structure" turns Green. "Content" turns Yellow.
5. **User**: Writes specific logic.
6. **Bar**: "Content" turns Green. "Links" turns Red (unlinked tools).
7. **Action**: AI suggests **"Link 3 Tools"**. User accepts.
8. **Bar**: All Green.
9. **Action**: AI suggests **"Final Polish"**. User accepts.
10. **Result**: A perfect, validated document.
