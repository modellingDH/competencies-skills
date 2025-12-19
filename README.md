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

### Phases 1-4 (✅ Completed)
- [x] Defined Schemas & Cognitive Markdown
- [x] MD-to-JSON-LD Interpreter & Semantic Validator
- [x] Discovery Portal & Authoring Studio
- [x] Local Storage & ZIP Export/Import

### Phase 5: Remote Integration & Library Scaling (✅ Completed)
- [x] **Virtualized Library Explorer** (`/library`): Support for large datasets with `react-virtuoso` and fuzzy search.
- [x] **Remote Repository Support**: Connect external GitHub repositories as library sources.
- [x] **Clone to Project**: Convert remote entities into local, editable copies with one click.

### Phase 6: Centralized Source Management (✅ Completed)
- [x] **Management Interface** (`/sources`): Dedicated dashboard to add, remove, and toggle repository sources.
- [x] **Metadata Enrichment**: Track and display entity origins (Source Repo name/URL) across the UI.
- [x] **Global Sync**: One-click synchronization for all connected and enabled sources.

### Phase 7: AI-Assisted Authoring (🏗️ Next Steps)
- [ ] **AI-Native Suggestions**: Advanced agent-specific feedback using remote context.
- [ ] **Guideline Documentation**: Standards for publishing and sharing skill repositories.

## 🌟 Features & Walkthrough

### 1. The Library Explorer
A high-performance interface for discovering and importing skills.
*   **Route**: `/library`
*   **Virtualized Grid**: Seamlessly browse thousands of entities.
*   **Multi-Source**: Combines local examples with remote repositories.
*   **Clone to Project**: Instantly import remote skills into your local workspace for customization.

### 2. The Authoring Studio
A powerful workbench for "Teaching AI".
*   **Route**: `/studio`
*   **Split-Pane Editor**: Write Markdown on the left, see validated JSON-LD on the right.
*   **Toolbox Search**: Search and reference all entities (Local & Remote) directly from the sidebar.
*   **AI Validator**: Client-side AI suggestions for fixing validation errors.
*   **Project Packaging**: Export your work as a standardized ZIP for redistribution.

### 3. Centralized Source Management
Control your library ecosystem.
*   **Route**: `/sources`
*   **Multiple Repos**: Support for connecting multiple GitHub repositories.
*   **Feature Toggles**: Enable or disable specific sources to curating your working environment.
*   **Verification**: Automatic detection of `registry.json` and repository metadata.

## 🛠️ Repository Structure

*   `docs/`: Research and planning documentation.
*   `public/examples/`: Local standard library entities.
*   `src/app/library/`: Library Explorer and entity detail views.
*   `src/app/sources/`: Repository management interface.
*   `src/components/Studio/`: Core authoring workbench and toolbox components.
*   `src/lib/`: Logic for AI validation, remote fetching, and file processing.
*   `src/services/`: Project state and data management.

## 🚀 Deployment

The AI Skills & Competencies library is a standard Next.js application that can be deployed to any modern cloud hosting provider.

### 1. One-Click Deployment (Recommended)
The easiest way to deploy is using **Vercel** or **Netlify**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FmodellingDH%2Fcompetencies-skills)

### 2. Manual Build
If you are hosting on your own infrastructure:

```bash
# Install dependencies
npm install

# Build the production application
npm run build

# Start the production server
npm run start
```

### 3. Static Export
If you want to host on **GitHub Pages**, update `next.config.ts` to use `output: 'export'` and run:

```bash
npm run build
```
The static files will be in the `out/` directory.

> [!NOTE]
> **GitHub API Limits**: For large-scale use of remote repositories, you may need to provide a `GITHUB_TOKEN` environment variable to increase rate limits, though this is not required for standard usage of the built-in library.

## 🤝 Contributing

This library follows the [schema.org](https://schema.org) standard and aligns with the [ESCO](https://esco.ec.europa.eu) ontology. To publish your own skills for others to use, simply host a repository with a `registry.json` file in the root.
