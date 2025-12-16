# Research Notes: AI Skills, Competencies, and Frameworks

## 1. Project Analysis & Goals
The objective is to define two relationships:
1.  **Skills**: Operational capabilities (what an agent *can* do). Inspired by coding agents (code gen, debugging, tool use).
2.  **Competencies**: Roles and objectives (what an agent *should* do/be).
3.  **Meta-Level Reasoning**: Logic to select the right competency for a context.

**Constraint**: Minimalistic technological solutions.

## 2. Existing Standards & Approaches

### A. Skills (Capabilities)
*   **Anthropic's Distinction**:
    *   **Tools**: Deterministic function calls (the hands/eyes). E.g., `getWeather`, `queryDatabase`.
    *   **Skills**: Procedural knowledge (the "how-to"). A "Skill" is a folder of instructions/resources that teaches an agent *how* to use tools to solve a specific problem class (e.g., "Data Analysis Skill" teaches how to use SQL + Python tools to answer a business question).
*   **Emerging Coding Practices**:
    *   **Tool Use**: The ability to format inputs for and parse outputs from external tools (LSP, grep, liners).
    *   **Context Management**: Managing window context, retrieval (RAG).
    *   **Chain-of-Thought**: Breaking down complex tasks.
*   **Interoperability Standards**:
    *   **MCP (Model Context Protocol)**: Standardizes connections to data/tools.
    *   **OASF**: Standardized schemas.

### B. Evaluation Strategies (Anthropic)
*   **Safety Levels (ASL)**: Categorizing risk.
*   **Red Teaming**: Adversarial testing.
*   **Evaluator-Optimizer Loop**: Using one model to critique/grade the output of another based on a "Rubric".
*   **Model-Generated Evaluations**: Using strong models to generate test cases.

### B. Competencies (Roles & Objectives)
*   **Human Competency Frameworks**:
    *   **SFIA (Skills Framework for the Information Age)**: Levels of responsibility (Autonomy, Influence, Complexity, Business Skills).
    *   **AI Fluency**: Delegation, Description, Discernment.
*   **Agent Roles**:
    *   **Planner vs. Executor**: Common separation (e.g., BabyAGI, AutoGPT).
    *   **Role-Based Access**: Defining agents by what they are *allowed* to do (Guardrails).

### C. Meta-Level Reasoning
*   **Reflection**: "Thinking about thinking".
*   **Dynamic Selection**:
    *   **Router Pattern**: Using a classifier to decide which agent/tool to use.
    *   **Supervisor Pattern**: A meta-agent managing state and delegating to workers (LangGraph).

## 3. Generalization Strategy
*   **Skills**: Abstract "Coding Tools" to "Interface Actions".
    *   *Coding*: Write File -> *General*: Modify Resource.
    *   *Coding*: Read Linter -> *General*: Check Constraint.
*   **Competencies**: Abstract "Developer" to "Creator", "Reviewer" to "Auditor".

### C. "Teaching TO AI" (Instructional Design for Agents)
*   **Core Concept**: "Teaching" is **Context Engineering**. We are not training weights; we are structuring the *context window* to instruct behavior.
*   **Instructional Components**:
    *   **System Prompts**: The "Lecture" or "Textbook" (The *Procedure*).
    *   **Few-Shot Examples**: The "Exercises" (Demonstrating correct Interpretation).
    *   **Rubrics**: The "Exam" (Self-Correction criteria).
*   **Interpretation**:
    *   **Mapping**: Explicitly instructing the agent: "When you see X, it implies Y." (e.g., "Error code 500 means retry, 404 means stop").
    *   **Reference**: Linking operational steps to human documentation (e.g., "Follow the style guide at [link]").

### F. Lessons from AI Robotics (Gemini, RT-2)
*   **Embodied Reasoning (ER)**: High-level "brain" model that breaks abstract goals ("sort laundry") into sub-tasks.
*   **Vision-Language-Action (VLA)**: Low-level "doer" model.
*   **Key Insight**: Robots "Think before Acting" by generating an internal Chain-of-Thought (CoT) in natural language.
*   **Application to Agents**:
    *   **Skill = High-Level Reasoning Policy.**
    *   **Tool = Low-Level Actuation.**
    *   **Instruction**: Teach the "Reasoning" model how to decompose tasks for the "Actuation" model.

### E. GitHub as Schema Database
*   **Structure**:
    *   Metadata in `YAML` Frontmatter or `metadata.json`.
    *   Content in `.md` (Human readable + Machine parseable via LLM).
    *   Versioning: Git provides history for "Concept Drift" in skills.
    *   Indexing: Tools like `MarkdownDB` can query this flat structure.

### G. Meta-Reasoning (The "Manager")
*   **Definition**: The ability of an agent to "think about its own thinking" to select the right Skill.
*   **Function**:
    *   **Skill Identification**: Matching user intent ("Sort this") to Skill capabilities (`classify_object`).
    *   **Self-Monitoring**: "Am I stuck? Do I possess the skill to solve this?"
*   **Implementation**: A "Router" or "Governor" layer that evaluates available Skills against the current Context.

### H. Competencies (The "Orchestrator")
*   **Definition**: A higher-order role (e.g., "Warehouse Manager") that combines multiple Skills.
*   **Architecture**:
    *   **Hierarchical Task Networks (HTN)**: Decomposing "Clean Warehouse" -> `navigate` + `classify` + `move_object`.
    *   **Behavior Trees**: Logic for switching between Skills (e.g., `Sequence: [Scan -> Classify -> Act]`).
*   **Example**: `WarehouseBot` competency combines `navigate_grid_2d` and `classify_object`.

### I. Professional AI Consistency Patterns (The "Reliability Layer")
*   **Structured Output**: Never rely on free text for ops. Enforce **JSON Schemas** (via Zod) for all agent decisions.
*   **Evaluation-Driven Development (EDD)**:
    *   **Unit Tests for Prompts**: Define "Golden Datasets" (Input -> Expected Output).
    *   **Metric**: "Did the agent select the correct tool?" "Did it extract the right SKU?"
*   **Guardrails**:
    *   **Runtime Checks**: Validators that run *after* LLM output but *before* Tool execution.
    *   **Example**: "If `confidence < 0.8`, force `RequestHumanReview`."

### J. Library & Ontology Strategy (Standard Alignment)
*   **Standards**:
    *   **Schema.org**: Use `DefinedTerm` for Skills/Competencies (linked to `DefinedTermSet`).
    *   **CaSS/ESCO**: Use hierarchical relations (`narrower`, `broader`, `requires`).
*   **GitHub Repository Structure** (inspired by CaSS/W3C):
    *   `/frameworks/`: High-level domains (e.g., "SoftwareEngineering").
    *   `/competencies/`: Groupings of skills (e.g., "Debugging").
    *   `/skills/`: Atomic Instructional Modules.
    *   `/tools/`: Atomic Capabilities (e.g., "Camera", "Linter").
    *   `/concepts/`: Shared vocabulary (`DefinedTerm` definitions for "LAVA", "CLIFF").
*   **Indexing**: Use `JSON-LD` to make the library crawling-friendly for the "Cognitive Web".

## 5. Proposed Conceptual Framework (Refined for "Instruction")

### New "Skill" Definition: An Instructional Module
A Skill is a package of **Instructions** designed to be injected into an agent's context.

*   **1. Instructional Context (The "Lesson")**:
    *   `id`: unique_key
    *   `name`: string
    *   `objective`: "You will learn to..."
    *   `required_context`: list[doc_references] (e.g., "Read file X before starting").
*   **2. Operational Procedure (The "Textbook")**:
    *   **Format**: `INSTRUCTIONS.md`. A System Prompt formatted as a procedure.
    *   **Examples**: "Good" vs "Bad" execution traces (Few-Shot).
*   **3. Cognitive Workflow (The "Mental Model" in Markdown)**:
    *   **Goal**: Define "Thinking Patterns" without using code or graphs.
    *   **Format**: Nested Markdown Lists with **Keywords**.
    *   **Keywords**:
        *   `> ACTION`: Do something.
        *   `? DECISION`: Ask a question.
        *   `@ CONTEXT`: Check environment.
        *   `! CRITICAL`: Safety check.
    *   **Example**:
        ```markdown
        - @ CONTEXT: Check if 'LAVA' is nearby.
        - ? DECISION: Is distance < 1m?
            - YES:
                - ! CRITICAL: Stop immediately.
                - > ACTION: Plan detour.
            - NO:
                - > ACTION: Move forward.
        ```
*   **4. Interpretation Rules (The "Glossary")**:
    *   **Concept**: Explicitly mapping *Tool Output* -> *Agent Understanding*.
*   **4. Interpretation Rules (The "Glossary")**:
    *   **Concept**: Explicitly mapping *Tool Output* -> *Agent Understanding*.
    *   **Format**: Markdown table or YAML dictionary.
    *   **Structure**:
        *   `Pattern`: Regex or value match (e.g., `status: "OK"`).
        *   `Meaning`: Semantic concept (e.g., "Operation Successful").
        *   `NextAction`: Recommended edge traversal (e.g., "Proceed to Analysis").
*   **5. Quality Assurance (The "Exam")**:
    *   **Golden Dataset**: List of `{input, expected_action}` pairs.
    *   **Guardrails**: Runtime rules (e.g., "Never delete > 5 files").
*   **6. Ontology Alignment (The "Label")**:
    *   **`alignment`**: List of external IDs (e.g., ESCO URI, WikiData ID).
    *   **`type`**: Schema.org `DefinedTerm`.
*   **7. Tools (The "Hands")**:
    *   **Definition**: Atomic, deterministic capabilities (Functions/APIs).
    *   **Schema**:
        *   `name`: Function name.
        *   `description`: What it does.
        *   `parameters`: JSON Schema of inputs.
        *   `source`: Path to implementation.

## 6. Comprehensive Examples

### A. Skill: `navigate_grid_2d` (Spatial Reasoning)

#### 1. Instructional Context (`skill.yaml`)
```yaml
id: navigate_grid_2d
name: "2D Grid Navigation"
objective: "Learn to interpret 2D coordinate objects and plan a safe path avoiding obstacles."
context_docs:
  - "docs/coordinates_system_v1.md"
tools:
  - "tools/scan_surroundings"
  - "tools/move_forward"
  - "tools/get_position"
```

#### 2. Ontology Alignment (`alignment.json`)
```json
{
  "type": "DefinedTerm",
  "termCode": "S1234",
  "inDefinedTermSet": "https://esco.ec.europa.eu/en/classification/skills",
  "name": "Navigate Unstructured Environments",
  "url": "https://schema.org/Skill"
}
```

#### 3. Operational Procedure (`INSTRUCTIONS.md`)
```markdown
# Precision Navigation Protocol

1. **Scan**: Always check your current position and immediate surroundings using `scan_surroundings()`.
2. **Plan**: Before moving, calculate the entire path to the target.
   - PREFER paths with high "safety_score".
   - AVOID paths that pass within 1 unit of "LAVA".
3. **Move**: Execute movement one step at a time.
4. **Verify**: After moving, check `get_position()` to confirm you are where you think you are.
```

#### 4. Cognitive Workflow (`workflow.md`)
```markdown
# Mental Model: Safe Navigation

- @ CONTEXT: Scan surroundings using `scan_surroundings()`.
- ? DECISION: Is an obstacle detected?
    - YES:
        - > ACTION: Calculate alternative path.
        - > ACTION: Log "Obstacle Avoidance" event.
    - NO:
        - > ACTION: Move forward using `move_forward()`.
- ! CRITICAL: Verify position with `get_position()`.
- ? DECISION: Are we at the goal?
    - YES:
        - > ACTION: Signal "Success".
    - NO:
        - ^ LOOP: Restart from "Scan".
```

#### 5. Interpretation Rules (`interpretation.yaml`)
```yaml
rules:
  - tool: scan_surroundings
    output_pattern: "type: 'void'"
    meaning: "Cliff Edge - Fatal Hazard"
    instruction: "Mark coordinate as INVALID_MOVE."

  - tool: get_position
    output_pattern: "slippage: true"
    meaning: "Movement Error"
    instruction: "Re-calibrate position before next move."
```

#### 6. Quality Assurance (`evals.yaml`)
```yaml
golden_dataset:
  - input: "Goal is at (5,5). LAVA is at (4,5)."
    expected_workflow: ["Scan", "Plan Detour", "Move"]
    assert_not_touched: ["(4,5)"]
guardrails:
  - rule: "max_consecutive_moves"
    limit: 5
    action: "Force Re-Scan"
```

### B. Skill: `classify_object` (Visual Analysis)

#### 1. Instructional Context
*   **Objective**: "Identify object type and fragility from visual data."
*   **Tools**: `camera.capture`, `camera.flash_on`.

#### 2. Ontology Alignment
*   **Schema.org**: `DefinedTerm: Visual Inspection`.

#### 3. Operational Procedure
"Always ensure lighting is > 500 lumens. If dark, use flash. Analyze shape first, then texture."

#### 4. Cognitive Workflow
```markdown
# Mental Model: Object Classification
- > ACTION: Capture high-res image `camera.capture()`.
- ? DECISION: Is lighting sufficient?
    - NO:
        - > ACTION: Enable flash `camera.flash_on()`.
        - ^ LOOP: Retry Capture.
    - YES:
        - > ACTION: Analyze features (Shape, Color, Texture).
- ? DECISION: Match confidence > 90%?
    - YES:
        - > ACTION: Return Label.
    - NO:
        - > ACTION: Request human verification.
```

#### 5. Interpretation Rules
*   `confidence < 0.5`: "Ambiguous Object" -> Request Zoom.
*   `color: "red" AND shape: "octagon"`: "Stop Sign".

#### 6. Quality Assurance
*   **Golden Dataset**: Image of "Cracked Vase" -> Output: "Fragile".
*   **Guardrails**: "Never output PII labels (names/faces)."


### C. Competency: `WarehouseBot` (Orchestration)
*   **Role**: "Sort implementation items in a grid warehouse."
*   **Skills**: `navigate_grid_2d`, `classify_object`.
*   **Behavior Tree (Orchestration)**:
    1.  **Search**: Use `navigate_grid_2d` in "Explore Mode".
    2.  **Found Item**: Trigger `classify_object`.
    3.  **Act**:
        *   If `Fragile` -> `HandleWithCare`.
        *   If `Heavy` -> `RequestForklift`.
    4.  **Repeat**.
*   **App**: Vite+React App that treats GitHub as a Headless CMS (using Octokit).
