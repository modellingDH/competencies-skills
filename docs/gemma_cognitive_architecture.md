# Gemma — Cognitive Architecture

## Philosophy

Gemma is the AI assistant embedded in the Studio editor. She helps users author,
evaluate, and refine cognitive skills. Her own behavior is defined by the same
system she helps users build: **meta-skills** for *how she thinks*, **skills**
for *what she does*, and **concepts** for *what she knows*.

---

## 1. Taxonomy

```
┌─────────────────────────────────────────────────────────────┐
│                      META-SKILLS                            │
│         (High-level cognitive procedures)                   │
│                                                             │
│   HOW Gemma reasons, regardless of the specific task.       │
│   These are reusable thinking patterns.                     │
│                                                             │
│   Examples: evaluating, co-authoring, composing, linking    │
└─────────────────────────────────────────────────────────────┘
         │
         │  invoke / orchestrate
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        SKILLS                               │
│           (Specific executable tasks)                       │
│                                                             │
│   WHAT Gemma does in concrete terms.                        │
│   Each skill has a clear input → output contract.           │
│                                                             │
│   Examples: write a skill document, suggest references,     │
│             decompose a complex skill, generate a revision  │
└─────────────────────────────────────────────────────────────┘
         │
         │  reference / ground in
         ▼
┌─────────────────────────────────────────────────────────────┐
│                       CONCEPTS                              │
│            (Declarative knowledge)                          │
│                                                             │
│   WHAT Gemma knows. Definitions, rules, formats.            │
│   Concepts are referenced but never "executed".             │
│                                                             │
│   Examples: entity type definitions, quality criteria,      │
│             linking conventions                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Gemma's Core Meta-Skills

Meta-skills are the **cognitive procedures** Gemma uses. They describe a mode of
thinking, not a specific task. A meta-skill can be activated across many
different situations.

```
                                    ┌──────────────────┐
                                    │  CO-AUTHORING    │
                                    │  (continuous     │
User writes ──────────────────────► │   observation    │ ◄─── background loop
                                    │   loop)          │
                                    └────────┬─────────┘
                                             │
                                    ┌────────┴─────────┐
                                    │ INTENT RECOGNITION│
                                    │  (understand what │
                                    │   the user needs) │
                                    └────────┬─────────┘
                                             │
                          ┌──────────────────┼────────────────────┐
                          │                  │                    │
                          ▼                  ▼                    ▼
                ┌─────────────────┐ ┌────────────────┐ ┌─────────────────┐
                │   GENERATIVE    │ │   EVALUATIVE   │ │   CONNECTIVE    │
                │   COMPOSITION   │ │    ANALYSIS    │ │    REASONING    │
                │                 │ │                │ │                 │
                │  produce new    │ │  assess what   │ │  find links and │
                │  content        │ │  exists        │ │  reuse patterns │
                └────────┬────────┘ └───────┬────────┘ └────────┬────────┘
                         │                  │                   │
                         └──────────────────┼───────────────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ ASSISTIVE DIALOGUE│
                                   │  (deliver to user │
                                   │   with explanation)│
                                   └──────────────────┘
```

### 2.1 Co-Authoring

**What it is:** The continuous background loop. Gemma watches the document evolve
as the user writes and decides when and how to intervene. This loop runs until
the document reaches a "Ready" state per the [Quality Criteria](/library/concept/quality_criteria).

- Observe: track what changed since the last check.
- Assess: run a lightweight quality check against the 8 readiness criteria.
- Decide: intervene only when it adds value (not mid-thought).
- Declare readiness: when all 8 criteria are met, suggest the document is ready.

### 2.2 Intent Recognition

**What it is:** Analyze the user's current state (cursor, draft, chat) and infer
what kind of help is needed. Dispatches to the right meta-skill.

- Empty document → scaffold.
- Incomplete → guide.
- Complete but unlinked → connect.
- User question → answer.

### 2.3 Generative Composition

**What it is:** Produce new content — drafts, revisions, alternatives.

- Scaffold mode: generate a skeleton from a title.
- Draft mode: fill in thin sections.
- Revise mode: improve based on feedback.

### 2.4 Evaluative Analysis

**What it is:** Assess content against the [Quality Criteria](/library/concept/quality_criteria).

- Check the 8 readiness criteria systematically.
- Classify maturity: Draft / Review / Ready.
- Produce structured feedback.

### 2.5 Connective Reasoning

**What it is:** Find relationships between the document and the library.

- Suggest links to related entities.
- Detect reuse opportunities.
- Detect decomposition needs.

### 2.6 Assistive Dialogue

**What it is:** Governs how Gemma communicates.

- Socratic: questions over declarations.
- Layered: key insight first, details on demand.
- Actionable: concrete next steps.
- Non-intrusive: respect the user's flow.

---

## 3. Gemma's Core Skills

Skills are **specific tasks** Gemma can perform. Each is invoked by a meta-skill.

```
┌───────────────────────────────────────────────────────────────────┐
│                          SKILLS                                   │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ scaffold_document │  │ suggest_links    │  │ write_feedback │  │
│  │                  │  │                  │  │                │  │
│  │ Generate a blank │  │ Scan library &   │  │ Write readable │  │
│  │ skill skeleton   │  │ suggest links    │  │ critique       │  │
│  │ from a title     │  │                  │  │                │  │
│  └──────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │ generate_revision│  │ decompose_skill  │                      │
│  │                  │  │                  │                      │
│  │ Produce improved │  │ Break a complex  │                      │
│  │ version of draft │  │ skill into       │                      │
│  │                  │  │ smaller ones     │                      │
│  └──────────────────┘  └──────────────────┘                      │
└───────────────────────────────────────────────────────────────────┘
```

| Skill | Input | Output | Invoked by |
|-------|-------|--------|------------|
| `scaffold_document` | Title / description | Full skeleton | Generative Composition |
| `suggest_links` | Draft + library | Link suggestions | Connective Reasoning |
| `generate_revision` | Draft + feedback | Improved version | Generative Composition |
| `write_feedback` | Draft + eval results | Structured critique | Evaluative Analysis |
| `decompose_skill` | Complex skill | Split proposal | Connective Reasoning |

---

## 4. Concepts (Knowledge base)

```
┌───────────────────────────────────────────────────────────────────┐
│                          CONCEPTS                                 │
│                                                                   │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐ │
│  │ entity_types          │  │ quality_criteria                  │ │
│  │                      │  │                                   │ │
│  │ Definitions of       │  │ The 8-point readiness checklist:  │ │
│  │ competency, skill,   │  │ coherent, complete, sound,        │ │
│  │ tool, concept,       │  │ classified, linked, atomic,       │ │
│  │ meta-skill            │  │ actionable, formatted             │ │
│  │ + classification     │  │                                   │ │
│  │ guide                │  │                                   │ │
│  └──────────────────────┘  └───────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────┐                                        │
│  │ linking_conventions  │                                        │
│  │                      │                                        │
│  │ When/how to use      │                                        │
│  │ markdown links to    │                                        │
│  │ cross-reference      │                                        │
│  │ library entities     │                                        │
│  └──────────────────────┘                                        │
└───────────────────────────────────────────────────────────────────┘
```

---

## 5. Execution Flow — The Co-Authoring Loop

```
 User opens or creates a document
              │
              ▼
 ┌────────────────────────────┐
 │  CO-AUTHORING              │◄─────────────────────────┐
 │                            │                          │
 │  OBSERVE: read current     │                          │
 │  state, track changes      │                          │
 └─────────────┬──────────────┘                          │
               │                                         │
               ▼                                         │
 ┌────────────────────────────┐                          │
 │  ASSESS: evaluate against  │                          │
 │  Quality Criteria          │                          │
 └─────────────┬──────────────┘                          │
               │                                         │
        ┌──────┴──────┐                                  │
        │             │                                  │
        ▼             ▼                                  │
   No change      Needs help                             │
   needed         │                                      │
   │              ▼                                      │
   │    ┌──────────────────────┐                         │
   │    │ INTENT RECOGNITION   │                         │
   │    └──────────┬───────────┘                         │
   │               │                                     │
   │    ┌──────────┼───────────────┐                     │
   │    │          │               │                     │
   │    ▼          ▼               ▼                     │
   │  generate   evaluate       connect                  │
   │    │          │               │                     │
   │    ▼          ▼               ▼                     │
   │  skills     skills         skills                   │
   │    │          │               │                     │
   │    └──────────┼───────────────┘                     │
   │               │                                     │
   │               ▼                                     │
   │    ┌──────────────────────┐                         │
   │    │ ASSISTIVE DIALOGUE   │                         │
   │    └──────────┬───────────┘                         │
   │               │                                     │
   │               ▼                                     │
   │         Deliver to user                             │
   │               │                                     │
   └───────────────┼─────────────────────────────────────┘
                   │         loop continues
                   │
            ┌──────┴──────┐
            │             │
         Not ready     READY
                          │
                          ▼
                 Declare document ready
                 "This looks complete."
```

---

## 6. Entity Inventory

### Meta-Skills (6)

| ID | Purpose |
|----|---------|
| `co_authoring` | Continuous observation and intervention loop |
| `intent_recognition` | Classify user need and dispatch |
| `generative_composition` | Produce content (scaffold, draft, revise) |
| `evaluative_analysis` | Assess quality against criteria |
| `connective_reasoning` | Library awareness, linking, decomposition |
| `assistive_dialogue` | Communication style and delivery |

### Skills (5)

| ID | Purpose |
|----|---------|
| `scaffold_document` | Generate skeleton from title |
| `suggest_links` | Recommend links to related entities |
| `generate_revision` | Improve based on feedback |
| `write_feedback` | Structured critique |
| `decompose_skill` | Split complex into atomic |

### Concepts (3)

| ID | Purpose |
|----|---------|
| `entity_types` | Type definitions + classification guide |
| `quality_criteria` | 8-point readiness checklist |
| `linking_conventions` | Cross-reference rules using markdown links |
