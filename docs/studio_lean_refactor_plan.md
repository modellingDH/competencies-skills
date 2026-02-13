# Studio Lean Refactor Plan

## Vision

Transform the Studio from a multi-step Wizard into a lean, professional **Integrated Development Environment (IDE)** for Cognitive Agents. The workflow simplifies to two main views: **Dashboard** (Management & Community) and **Editor** (Composition & Library).

## Core Philosophy

1. **Competency is Root**: A "Document" represents a single **Competency**. It is the entry point.
2. **Shared Library**: Skills, Tools, and Concepts are shared resources available to *all* competencies. They are managed via a sidebar and referenced by ID.
3. **Contextual Intelligence**: Validation and Instructions are embedded as tooltips and non-intrusive indicators, removing dedicated "Validation" steps.

---

## 1. View Architecture

### A. View 1: The Dashboard ("Your Competencies")

The landing page for the Studio.

* **Competency Grid/List**: Cards showing local competencies.
  * *Status Indicators*: Draft, Valid, Published.
  * *Actions*: Edit, Delete, Share.
* **Community Hub Integration**:
  * "Share to Community" button on cards.
  * "Browse Community" tab to import competencies.
* **Create New**: Big "+" button to start a fresh Competency (starts the Editor).

### B. View 2: The Intelligent Editor

A unified workspace for authoring.

#### **Layout**

* **Left Sidebar: Entity Library (The Palette)**
  * **Tabs**: Skills, Tools, Concepts.
  * **Search**: Filter entities by name/tag.
  * **List**: Draggable items or "Click to Copy ID" items.
  * **Quick Create**: A small form or "+" button to define a *new* Skill/Tool on the fly without leaving the context.
* **Center: Cognitive Monaco Editor**
  * The main canvas. Editing the Competency Markdown.
  * **Syntax Highlighting**: Enhanced for `@entity:id` references.
  * **Hover Tooltips**: Hovering over `@skill:xyz` shows a preview of that skill.
  * **Validation**: Squiggles (markers) for errors. No separate validation bar taking up space; use a discrete status indicator in the header (e.g., "Health: 90%").
* **Overlays / Tooltips (Instructions)**
  * instead of a "Guide" sidebar, use **Contextual Tooltips**.
  * *Example*: Empty state shows a watermark or helper text: "Start by defining the Role..."
  * *Example*: Hovering a specific section header (e.g., `## Guardrails`) shows a tooltip explaining what it is.

---

## 2. Validation & Intelligence Refactor

* **Remove "Validation Step"**: The distinct wizard step is gone.
* **Real-time Feedback**:
  * `useStudioIntelligence` runs in the background.
  * Errors (Missing links, structure issues) appear as **Inline Markers** (red/yellow squiggles) with hover explanations.
  * **Smart Actions**: A single "Magic Wand" or "Action" button in the editor header lights up when AI has a high-confidence fix (e.g., "Fix broken links", "Polish text").

---

## 3. Data Model Refactor

* **Current**: `Project` = Independent collection of `Competencies` + `Skills` + `Tools`.
* **Refactored**: `Workspace` = `Library` + `Competencies`.
  * **Library**: A global JSON/Folder of reusable `Skills`, `Tools`, `Concepts`.
  * **Competencies**: Individual files that reference the Library.
  * *Storage*:
    * `~/.cognitive-studio/library/skills/*.md`
    * `~/.cognitive-studio/library/tools/*.md`
    * `~/.cognitive-studio/competencies/*.md`

---

## 4. Implementation Steps

### Phase 1: Layout & Navigation Schema

1. Create `DashboardPage` (replaces current Home/Session selection).
2. Create `EditorLayout` (Left Sidebar + Main Editor).
3. Remove `WizardContext` state machine; replace with simple `EditorContext` (Current Document + Library Access).

### Phase 2: The Entity Library (Left Sidebar)

1. Build `LibrarySidebar` component.
2. Implement `EntityList` with Search.
3. Implement `QuickCreate` modal for adding new Skills/Tools to the library.

### Phase 3: Editor Enhancements

1. Update `CognitiveMonacoEditor` to support the new "Root Competency" focus.
2. Implement "Tooltip Instructions" (Monaco HoverProviders or UI Overlays).
3. Migrate `ValidationSidebar` logic to a **Status Widget** (e.g., top-right corner).

### Phase 4: Data Layer

1. Refactor `useWizard` hooks to read/write from the new centralized `Library` structure.
2. Ensure backward compatibility or provide a migration tool for existing projects.

### Phase 5: Community Sharing

1. Implement `ShareCompetency` dialog (Gist/Repo export).
2. Implement `ImportCompetency` flow.
