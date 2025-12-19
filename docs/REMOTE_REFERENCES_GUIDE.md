# Guide: Using Remote References in Agent Workflows

The power of the AI Skills & Competencies framework lies in **cross-domain referenceability**. This allows an agent to leverage skills from multiple specialized libraries.

## 1. Syntax for References
In the Authoring Studio and in your Markdown definitions, you can reference other entities using the `@` syntax:

```markdown
# Network Security Analyst (Competency)

Objective: Analyze and mitigate threats.

> ACTION: Use [@skill:analyze_log_file](...) to parse traffic patterns.
> ACTION: Reference [@concept:sql_injection](...) to identify attack vectors.
```

## 2. Remote vs. Local Resolution
- **Project IDs**: If the ID exists in your local project, the Studio will prioritize it.
- **Remote IDs**: If an ID is not found locally, the system searches all **Enabled** remote sources for a match.

## 3. Reference Injection (Studio)
In the [Authoring Studio](file:///Users/alessioantonini/Code/competencies-skills/src/app/studio/page.tsx), you can:
1. Search for any entity in the **Toolbox** sidebar.
2. Click the **Copy Reference** button.
3. Paste the reference directly into your Markdown flow.

## 4. Orchestration Example
Imagine building a "Security Operations" agent:
1. You connect the `Standard Library` (local).
2. You add the `Cybersecurity Experts Pack` (remote repo).
3. You create a local **Competency** that combines:
    - `Standard:http_request` (Tool)
    - `Expert:deep_packet_inspection` (Skill)

The final exported ZIP will include a bundled view of these relationships, making it easy to deploy the agent with all its dependencies.

## 5. Metadata and Context
When an agent ingests a skill, it doesn't just get the text. It gets the **Source Metadata**:
- The **Source Repository** name (for trust assessment).
- The **URI** of the entity (for canonical referencing).
- The **Validation Status** (to ensure the skill is safe to follow).
