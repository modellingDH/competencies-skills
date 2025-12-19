# Pending Activities & Roadmap

This document outlines the remaining tasks and future directions for the AI Skills & Competencies project.

## 1. Phase 1 Leftovers: UX Improvements
- **Sorting Options**: Implement sorting by Name, Type, and Date in the [Library Explorer](file:///Users/alessioantonini/Code/competencies-skills/src/app/library/page.tsx).
- **Advanced Filtering**: Add multi-select tags and source-specific filtering in the Library.

## 2. Phase 7: Documentation & Guidelines
- **Publishing Guide**: Create a step-by-step tutorial on how to host a remote repository for the library.
    - Document the `registry.json` schema.
    - Define folder structure conventions for `public/examples`.
    - Best practices for versioning remote entities.
- **Workflow Guide**: Provide examples of how AI agents can leverage remote references (`@type:id`) in their system prompts.

## 3. Future AI Enhancements
- **Context-Aware Validation**: Enable the `AIValidator` to "read" referenced remote entities to check for cross-dependency errors.
- **Auto-Fixing**: Implement a "Apply AI Suggestion" button that automatically modifies the Markdown content in the Studio.

## 4. Maintenance & Operations
- **GitHub Action Utility**: A script to automatically update the `registry.json` based on the files present in the repository.
- **CI/CD Validation**: Run SHACL validation on all files in a repository before allowing them to be indexed by the Library.
