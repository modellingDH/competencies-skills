# AI Skills & Competencies Library

**A GitHub-backed library for defining, managing, and instructing AI agents.**

This project aims to standardize how we teach AI agents by defining:
1.  **Skills**: Instructional Modules (Mental Models + Procedures) for specific capabilities.
2.  **Competencies**: Higher-order roles that orchestrate multiple skills.
3.  **Tools**: Atomic, deterministic capabilities (Functions/APIs).
4.  **Meta-Reasoning**: Logic for selecting the right skill for the right context.

The framework emphasizes **Instructional Design for Agents** ("Teaching TO AI") over traditional model training, using structured context engineering, "Cognitive Markdown" workflows, and strict ontology alignment (Schema.org, ESCO).

## 📚 Documentation

Detailed research and implementation plans can be found in the `docs/research/` directory:

*   **[Conceptual Framework & Research Notes](docs/research/research_notes.md)**: Deep dive into the "Instructional Module" theory, Cognitive Markdown, and Enterprise Consistency patterns.
*   **[Implementation Plan](docs/research/implementation_plan.md)**: Phased roadmap for building the schema library and web interface.

## 🚀 Project Status

### Phase 1: Research & Definition (✅ Completed)
- [x] Define "Skill" vs "Competency" Distinction
- [x] Research "Cognitive Markdown" for Workflows
- [x] Define "Quality Assurance" & "Reliability Layer"
- [x] Define "Library Strategy" & Ontology Alignment

### Phase 2: Schema Implementation (🚧 In Progress)
- [ ] Implement **Tool Schema** (Atomic Capabilities)
- [ ] Implement **Skill Schema** (Zod + Cognitive Parser)
- [ ] Implement **Competency Schema** (Orchestration)
- [ ] Implement **Library Schema** (Frameworks & DefinedTerms)

### Phase 3: Interface & Library (📅 Planned)
- [ ] Build GitHub-backed Web Application (Vite + React)
- [ ] Implement "Cognitive Workflow" Editor
- [ ] Build "Knowledge Graph" Indexer

## 🛠️ Repository Structure

*   `docs/`: Research and planning documentation.
*   `src/data/frameworks/`: High-level domains (e.g., Software Engineering).
*   `src/data/competencies/`: Groupings of skills.
*   `src/data/skills/`: Atomic Instructional Modules.
*   `src/data/tools/`: Atomic Capability definitions.
*   `src/schemas/`: TypeScript/Zod definitions for the library.

## 🤝 Contributing

This library follows the [schema.org](https://schema.org) standard for `DefinedTerm` and aligns with the [ESCO](https://esco.ec.europa.eu) ontology.
