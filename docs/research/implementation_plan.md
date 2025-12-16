# Implementation Plan - AI Skills & Competencies Framework

# Goal Description
Build a minimalistic, general-purpose system to define and explore AI skills and competencies.
The system includes:
1.  **Conceptual Framework**: JSON Schemas for Skills, Competencies, and Meta-Reasoning.
2.  **Web Application**: A visual interface to:
    *   Explore General Definitions (Read-only documentation/schema view).
    *   Manage Library of Examples (CRUD for skills/competencies).

## User Review Required
> [!IMPORTANT]
> **Tech Stack Choice**: Proposing **Vite + React + Vanilla CSS**.
> This balances "minimalism" (fast build, standard web tech) with the "app-like" requirements of a Library (forms, state, lists).
> *Alternatives considered*: Plain HTML/JS (too hard to maintain for a library app), Docusaurus (good for docs, bad for custom app logic).

> [!NOTE]
> **Data Persistence**: For this prototype, data will be stored in **local JSON files** served by the app, or **LocalStorage** for user-created examples, to keep it serverless and minimalistic.

## Proposed Changes

### Conceptual Framework (Schemas)
### Conceptual Framework (Schemas)
### Conceptual Framework (Schemas)
#### [NEW] [src/types/schemas.ts](file:///Users/alessioantonini/Code/competencies-skills/src/types/schemas.ts)
*   **Tool (Atomic Capability)**:
    *   `Definition`: JSON Schema for input/output.
    *   `Source`: Link to implementation (Local function or API).
*   **Skill (Instructional Module)**:
    *   `InstructionalMeta`: Objectives, RequiredContext (Docs), **RequiredTools**.
    *   `SystemPromptRef`: Link to `INSTRUCTIONS.md`.
    *   `Workflow`: "Cognitive Markdown" (Mental Model).
    *   `InterpretationRules`: Output mappers.
    *   `EvaluationSpec`: Golden datasets & Assertions.
*   **Competency (Orchestrator)**:
    *   `Role`: High-level name (e.g. "WarehouseBot").
    *   `SkillSet`: List of `Skill` IDs.
    *   `BehaviorTree`: Logic for combining Skills.
*   **Meta-Reasoning**:
    *   `SkillSelectionPolicy`: Rules for when to pick which skill.

## Phase 3: Schema Implementation & Validation
Implement the core logic *before* the UI.

#### [NEW] [src/schemas/](file:///Users/alessioantonini/Code/competencies-skills/src/schemas/)
*   `tool.schema.ts`: Zod schema for Tool definitions.
*   `skill.schema.ts`: Zod schema for Skill + Cognitive Markdown parser + Ontology Alignment (`DefinedTerm`).
*   `competency.schema.ts`: Zod schema for Competency + Behavior Tree.
*   `meta.schema.ts`: Zod schema for Meta-Reasoning policies.
*   `eval.schema.ts`: Schema for defining Golden Datasets.
*   `library.schema.ts`: Schema for `Framework` and `DefinedTerm` (Ontology).

#### [NEW] [tests/schemas/](file:///Users/alessioantonini/Code/competencies-skills/tests/schemas/)
*   `workflow_parser.test.ts`: Validate Markdown -> Graph parsing.
*   `competency.test.ts`: Validate Skill Reference logic.
*   `eval_runner.ts`: (Draft) Script to run a Skill against its Golden Dataset.

## Phase 4: Interface Implementation
### Library Management Strategy
*   **Repository Structure**:
    *   `src/data/tools/`: Definitions of atomic Tools.
    *   `src/data/skills/`: Flat list of Skill definitions.
    *   `src/data/concepts/`: Ontology terms (Schema.org `DefinedTerm`).
    *   `src/data/frameworks/`: CaSS-style Framework definitions.
*   **Indexing**: Implement a "Knowledge Graph" builder that scans these folders and builds an in-memory graph of `Skill -> requires -> Tool`.

### Web Application
Build the GitHub-backed web app.

### Web Application Structure (GitHub-Backed)
#### [NEW] [src/services/github.js](file:///Users/alessioantonini/Code/competencies-skills/src/services/github.js)
*   `Octokit` integration to fetch/commit files to the target repository.
*   Functions: `fetchSkill(id)`, `saveSkill(id, data)`, `listSkills()`.

#### [NEW] [src/components/SkillEditor/](file:///Users/alessioantonini/Code/competencies-skills/src/components/SkillEditor/)
*   **`PedagogyForm.jsx`**: Metadata editing.
*   **`ProcedureEditor.jsx`**: Mixed Markdown/Reference editor.
*   **`CognitiveWorkflowEditor.jsx`**: Text area for "Cognitive Markdown" (Lists with `?`, `>`, `@` keywords).
    *   Includes a "Preview" pane that renders the list as a simple indented tree.

#### [NEW] [src/components/Library/](file:///Users/alessioantonini/Code/competencies-skills/src/components/Library/)
*   `ReferenceLinker.jsx`: Component to search and link to Human Docs (`.md` files) in the repo.

## Verification Plan

### Automated Tests
*   **Schema Validation**: Ensure the Markdown parser correctly identifies nodes in the "Cognitive Markdown".

### Manual Verification
1.  **GitHub Connection**:
    *   Configure App with a Repo Token.
    *   Verify it lists files from your GitHub repo.
2.  **"Teaching" Flow**:
    *   Create a Skill "DebugPython".
    *   Write a Procedure illustrating the thought process.
    *   Define a Workflow using `? DECISION` and `> ACTION` syntax.
    *   Save and verify the `.md` file structure in the Repo.
