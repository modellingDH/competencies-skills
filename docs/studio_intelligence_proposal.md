# Proposal: Intelligent Studio with Embedded Validation & Feedback

## Overview

This proposal outlines the transformation of the current "Studio" editor into an intelligent, validation-driven environment. By leveraging local LLMs (Gemma via WebLLM) in the background, we can provide real-time feedback, inline suggestions, and structural validation without disrupting the user's flow.

## Core Concepts

### 1. Embedded Intelligence (The "Copilot" Model)

Instead of manual "Suggest" buttons, the editor will continuously analyze the content as you type (debounced).

- **Inline Decorations**:
  - **Yellow Squiggle**: Warning (e.g., missed Entity reference, unclear phrasing, passive voice).
  - **Red Squiggle**: Error (e.g., broken cognitive logic, missing required section).
  - **Blue Dotted Underline**: Suggestion (e.g., "Link to existing entity?").
- **Side Comments**: A "Review" panel or gutter annotations that explain complex issues.
- **Ghost Text**: Light gray text appearing ahead of the cursor proposing the next logical step or completion (tab to accept).

### 2. Implementation Strategy

To support these rich features, we propose migrating the editor component from a simple `TextField` to a **Monaco Editor** instance.

- **Why Monaco?**
  - Native support for **Markers** (squiggles).
  - Native support for **Code Actions** (Cmd+. / Lightbulb fixes).
  - Native support for **Hover** tooltips.
  - Native support for **Ghost Text** (Inline Completions).
  - Extremely performant for large files.

### 3. Architecture

#### A. Editor Component (`CognitiveMonacoEditor.tsx`)

Replaces `CognitiveMarkdownEditor`.

- Initializes a Monaco instance.
- Registers a custom language ID `cognitive-markdown`.
- Defines a custom theme matching the app's aesthetic.

#### B. Background Intelligence Service (`StudioIntelligenceService.ts`)

A dedicated service running in a Web Worker or main thread (carefully managed) to avoid UI freezing.

- **Input**: Current editor text (debounced, e.g., 2s after last keystroke).
- **Process**:
    1. **Regex Validator**: Fast checks for syntax (e.g., `> ACTION:` format).
    2. **Entity Linker**: Fast check against known project entities (Are you mentioning "Python" but not linking `@skill:python`?).
    3. **LLM Analyzer (Gemma)**:
        - Prompt: "Analyze this text. Identify logical gaps, missing prerequisites, or unclear instructions. Output JSON: `[{ line: 10, severity: 'warning', message: '...' }]`."
- **Output**: A list of `Diagnostics` compatible with Monaco's `IMarkerData`.

#### C. User Interaction Loop

1. **User types**: "The agent should check the database."
2. **Service detects**: "database" matches `@tool:database_connector`.
3. **UI Update**:
    - Blue squiggle under "database".
    - Hover text: "Potential link to @tool:database_connector".
    - Code Action: "Convert to Link".
4. **User accepts**: Click "Quick Fix" -> Text becomes "The agent should check the @tool:database_connector."

### 4. Leveraging Gemma (Local LLM)

We will use `@mlc-ai/web-llm` which is already in dependencies.

- **Task 1: Semantic Validation**: "Is this 'DECISION' block missing a 'NO' branch?" (Hard to do with regex, easy for LLM).
- **Task 2: Style Refinement**: "This objective is vague. Suggestion: 'Retrieve *all* records...'".
- **Task 3: Ghost Completion**: If user types `## Required Tools`, Gemma predicts `- @tool:` based on the content above.

### 5. Transition Plan

1. **Phase 1**: Install `@monaco-editor/react`. Replace `TextField` with `MonacoEditor`. Re-implement basic highlighting.
2. **Phase 2**: Implement `StudioIntelligenceService`. Connect Regex/Entity validators.
3. **Phase 3**: Connect Gemma for "Deep Analysis" (background loop).
4. **Phase 4**: Add "Side Comments" feature (using Monaco Zones or external UI synced to line numbers).

## Feasibility

- **Performance**: Monaco is heavy but standard. Gemma inference is heavy. Running detection logic only when idle (debounce 2-5s) ensures fluidity.
- **Complexity**: High initially, but drastically simplifies the *user's* task of writing correct structured content.
