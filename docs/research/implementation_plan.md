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
*   `shacl.ttl`: **[NEW]** SHACL Shapes for validating Skill/Competency RDF validity.

#### [NEW] [src/interpreter/](file:///Users/alessioantonini/Code/competencies-skills/src/interpreter/)
*   `md_to_jsonld.ts`: CORE Module. Parses Markdown -> AST -> JSON-LD.
    *   **Gap Detection**: specific checks for missing branches or undefined tools.
    *   **Ambiguity Check**: "Did you mean 'Scan' or 'Search'?"

#### [NEW] [tests/schemas/](file:///Users/alessioantonini/Code/competencies-skills/tests/schemas/)
*   `workflow_parser.test.ts`: Validate Markdown -> Graph parsing.
*   `competency.test.ts`: Validate Skill Reference logic.
*   `eval_runner.ts`: (Draft) Script to run a Skill against its Golden Dataset.
*   `semantic_validator.ts`: **[NEW]** Script to convert Zod objects to JSON-LD and run SHACL validation.

## Phase 4: Interface Implementation (The "Cognitive Web")
### Part A: Public Discovery Portal ("The Library")
*   **Stack**: Next.js (Static Export).
*   **Features**: Read-only explorer. Index of JSON-LD entities.
*   **Data Source**: Fetches from raw GitHub content or `MarkdownDB` index.

### Part B: Authoring Studio ("The Workbench")
*   **Stack**: React (Client-Side Only) + `JSZip`.
*   **Strategy**: Local-First, No Authentication.
*   **Workflow**:
    1.  **Start**: Create new Project or drag-and-drop existing folder/ZIP.
    2.  **Edit**: In-memory editing of Competencies, Skills, Tools, and Concepts.
    3.  **Export**: Generates valid folder structure as a ZIP file.
    4.  **Publish**: User manually uploads contents to GitHub.
*   **Features**:
    *   **Case Study Wizard**: Step-by-step guide to documenting a domain (Competencies -> Skills -> Tools -> Concepts).
    *   **Embedded Guidelines**: "Authoring Guide" rules appear as context-sensitive help.
    *   **Project Recovery**: Re-hydrate state from uploaded ZIP/folder.

### Web Application Structure (Local Studio)
#### [NEW] [src/services/project_manager.ts](file:///Users/alessioantonini/Code/competencies-skills/src/services/project_manager.ts)
*   Handles in-memory project state (`{ competencies: [], skills: [], ... }`).
*   `exportProject()`: Uses `JSZip` to bundle `.md` and generated `.json-ld` files.
*   `importProject()`: Parses uploaded ZIP/files to restore state.

#### [NEW] [src/components/Wizard/](file:///Users/alessioantonini/Code/competencies-skills/src/components/Wizard/)
*   `WizardContainer.tsx`: Manages step progress.
*   `DomainStep.tsx`: Define high-level Competency/Role.
*   `SkillDecomposition.tsx`: Break down Role into Skills.
*   `ToolMap.tsx`: Assign tools to Skills.
*   `ConceptDefinition.tsx`: Define shared vocabulary.

#### [NEW] [src/components/Guidance/](file:///Users/alessioantonini/Code/competencies-skills/src/components/Guidance/)
*   `GuidanceSidePanel.tsx`: Shows relevant "Do's and Don'ts" based on current step.

## Verification Plan

### Automated Tests
*   **Schema Validation**: Ensure the Markdown parser correctly identifies nodes in the "Cognitive Markdown".

### Manual Verification
1.  **Project Workflow**:
    *   Start "New Case Study".
    *   Define a Competency and Skill.
    *   Export ZIP.
    *   Reload page and Import ZIP.
    *   Verify state is restored correctly.
2.  **Output Validation**:
    *   Unzip export.
    *   Verify folder structure matches `src/data/` convention.
    *   Check that JSON-LD files are valid.
