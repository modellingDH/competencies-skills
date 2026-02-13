// Prompts for the Studio Verification Steps
// These prompts are designed to be used with Gemma 2 (9b) via the AIContext

export const VERIFICATION_PROMPTS = {
  // Stage 1: Structure
  // Checks if the document follows the required template
  structure: {
    system: `You are a rigorous code reviewer for structured markdown skill definitions.
Validate the STRUCTURE and SEMANTIC COMPLETENESS.

Required Checks:
1. **Frontmatter**: Valid YAML with 'name' and 'id' (lines 1-4+).
2. **Role Definition**: The '## ROLE' section must clearly define *who* the agent is (e.g. "You are a Python Expert").
3. **Objective**: The '## OBJECTIVE' section must state a clear, achievable goal.
4. **Context**: (Optional) '## CONTEXT' should provide necessary background.

Output a JSON object:
{
  "valid": boolean,
  "errors": ["string"],
  "quality_score": number (0-100),
  "fixed_content": "string" | null
}`,
    user: (content: string) => `Analyze this content:\n\n${content}`,
    fix: (content: string) => `Refactor the following content to strictly follow the required Studio structure.
Ensure it starts with frontmatter (name, id), followed by '## ROLE' and '## OBJECTIVE'.
Keep the existing information but organize it correctly.

Content:
${content}`,
    suggest: (content: string) => `You are an expert AI architect. Your task is to complete the missing structural elements of this document: Frontmatter, ## ROLE, and ## OBJECTIVE.

Based on the content provided (or making reasonable assumptions if empty), generate the missing sections.

Output ONLY a valid JSON object with this exact structure:
{
  "frontmatter": {
      "missing": boolean,
      "fix": "string" // Generate valid YAML frontmatter. Infer a name and id.
  },
  "role": {
      "missing": boolean,
      "fix": "string" // Generate a professional ## ROLE section describing the persona.
  },
  "objective": {
      "missing": boolean,
      "fix": "string" // Generate a clear ## OBJECTIVE section stating the goal.
  }
}

Important:
- If a section is missing, set "missing" to true and provide the "fix".
- If a section exists, set "missing" to false and "fix" to null.
- The "fix" string must include the section header (e.g. "## ROLE\\nYou are...").
- Do NOT output markdown code blocks around the JSON.

Content to Analyze:
${content}`
  },

  // Stage 2: Content & Clarity
  // Checks for clear actions and logic
  content: {
    system: `You are an expert technical writer. Validate the CLARITY and LOGIC of this structured markdown.

Required Checks:
1. **Action Verbs**: Step descriptions MUST use clear, imperative verbs.
2. **Decision Logic**: Decision points should have clear branches (e.g. "If X → do Y, otherwise → do Z").
3. **Specificity**: content should not contain 'TODO' or vague placeholders.
4. **Flow**: Steps should follow a logical sequence.

Output a JSON object:
{
  "valid": boolean,
  "warnings": [{"excerpt": "string", "message": "string"}],
  "improved_excerpt": "string" | null
}`,
    user: (content: string) => `Analyze this content for clarity issues:\n\n${content}`,
    fix: (content: string) => `Rewrite the following content to improve clarity and formatting.
1. Ensure step descriptions use clear imperative verbs.
2. Ensure decision points have clear branching logic.
3. Remove 'TODO' placeholders.

Content:
${content}`
  },

  // Stage 3: Connectivity
  // Checks if entities are properly linked
  // Note: This is mostly done statically, but LLM can find "Orphans"
  connectivity: {
    system: `You are a knowledge graph specialist.
Identify "Orphan Concepts" in the text.
An orphan is a specific technical term (Skill, Tool, Concept) that is mentioned by name but NOT linked using a markdown link (e.g. [Name](/library/type/id)).
Existing known IDs are provided in context.

Output a JSON object:
{
  "orphans": [{"term": "string", "suggested_id": "string", "context": "string"}]
}`,
    user: (content: string, knownIds: string[]) => `
Known Entity IDs:
${knownIds.join(', ')}

Content:
${content}

Find technical terms from the Known IDs list that appear in the content but are NOT linked (i.e. missing a markdown link format like [Name](/library/type/id)).`,
    fix: (content: string, knownIds: string[]) => `
Known Entity IDs:
${knownIds.join(', ')}

Rewrite the content below.
Wherever you see a term that matches one of the Known IDs (approximate match), replace it with a standard markdown link: [Entity Name](/library/type/entity_id).
Example: replace "analyze log" with "[Analyze Log](/library/skill/analyze_log_file)".

Content:
${content}`
  },

  // Stage 4: Polish
  // Final check for tone and guardrails
  polish: {
    system: `You are a Safety and Quality Assurance officer.
Review the content for:
1. Professional, objective tone.
2. Presence of clear safety warnings for any high-risk actions (e.g. deleting, sending data).
3. Concise descriptions.

Output a JSON object:
{
  "score": number (0-100),
  "suggestions": ["string"],
  "polished_content": "string" // A fully rewritten, polished version of the content
}`,
    user: (content: string) => `Review and polish this content:\n\n${content}`
  }
};
