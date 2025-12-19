# AI Skills & Competencies Library

**A GitHub-backed library for defining, managing, and instructing AI agents.**

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **UI Component Library**: [Material UI (MUI) v6](https://mui.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Schema Standard**: [Schema.org](https://schema.org/) (JSON-LD)

## Core Framework
The library is organized into four main schemas:

1.  **Skills** (`schema:HowTo`): Instructional modules that teach an agent *how* to perform a task using available tools.
2.  **Competencies** (`schema:Role`): Higher-order roles that orchestrate multiple skills to achieve complex objectives.
3.  **Tools** (`schema:SoftwareApplication`): Atomic, deterministic capabilities (functions/APIs) exposed to the agent.
4.  **Concepts** (`schema:DefinedTerm`): Shared vocabulary and domain definitions to ensure semantic consistency.

The framework emphasizes **Instructional Design for Agents** ("Teaching TO AI") over traditional model training, using structured context engineering, "Cognitive Markdown" workflows, and strict ontology alignment (Schema.org, ESCO).

## 📚 Documentation

Detailed research and implementation plans can be found in the `docs/` directory:

*   **[Authoring Guide (Best Practices)](docs/AUTHORING_GUIDE.md)**: Determines "Do's and Don'ts" for creating high-quality Agent Skills, based on Anthropic's methodology.
*   **[Conceptual Framework & Research Notes](docs/research/research_notes.md)**: Deep dive into the "Instructional Module" theory, Cognitive Markdown, and Enterprise Consistency patterns.
*   **[Implementation Plan](docs/research/implementation_plan.md)**: Phased roadmap for building the schema library and web interface.

## 🚀 Project Status

### Phase 1: Research & Definition (✅ Completed)
- [x] Defined "Skill" vs "Competency" Distinction
- [x] Researched "Cognitive Markdown" for Workflows
- [x] Defined "Library Strategy" & Ontology Alignment
- [x] **[NEW] Integrated Anthropic's "Agent Skills" Best Practices**

### Phase 2: Schema Implementation (✅ Completed)
- [x] **Tool Schema** (Atomic Capabilities)
- [x] **Skill Schema** (Zod + Cognitive Parser)
- [x] **Competency Schema** (Orchestration)
- [x] **Library Schema** (Frameworks & DefinedTerms)

### Phase 3: Semantic Engine (✅ Completed)
- [x] **MD-to-JSON-LD Interpreter**: Compiles Markdown to Schema.org standards.
- [x] **Semantic Validator**: SHACL-based validation for logical consistency.

### Phase 4: Interface Implementation (✅ Completed)
- [x] **Material UI Migration**: Complete redesign mimicking Schema.org's aesthetic.
- [x] **Discovery Portal** (`/search`): Read-only explorer for agents and humans.
- [x] **Authoring Studio** (`/studio`): Authenticated Editor with real-time validation.
- [x] **GitHub Integration**: Direct commit/push workflow for managing skills.

## 🌟 Features & Walkthrough

### 1. The Core Semantic Engine
At the heart of the library is the **Interpreter** (`src/interpreter/`), which acts as a bridge between human instruction and machine understanding.
*   **Input**: "Cognitive Markdown" (structured lists with `> ACTION`, `? DECISION`).
*   **Process**: Parses text, checks for ambiguity, and validates against SHACL shapes.
*   **Output**: Schema.org-compliant `JSON-LD` (HowTo schema) ready for agent ingestion.

### 2. The Discovery Portal
A public interface to explore the library.
*   **Route**: `/search`
*   **Function**: Indexes local `.md` files and presents them as structured Skill Cards.

### 3. The Authoring Studio
A powerful workbench for "Teaching AI".
*   **Route**: `/studio`
*   **Split-Pane Editor**: Write Markdown on the left, see validated JSON-LD on the right.
*   **Real-time Feedback**: The interpreter runs constantly, flagging logical gaps or missing context.
*   **Direct Sync**: Changes are committed directly to the GitHub repository using your credentials.

## 🛠️ Repository Structure

*   `docs/`: Research and planning documentation.
*   `src/data/frameworks/`: High-level domains (e.g., Software Engineering).
*   `src/data/competencies/`: Groupings of skills.
*   `src/data/skills/`: Atomic Instructional Modules.
*   `src/data/tools/`: Atomic Capability definitions.
*   `src/schemas/`: TypeScript/Zod definitions for the library.

## 🤝 Contributing

This library follows the [schema.org](https://schema.org) standard for `DefinedTerm` and aligns with the [ESCO](https://esco.ec.europa.eu) ontology.
