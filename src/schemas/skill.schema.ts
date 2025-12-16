import { z } from 'zod';
import { DefinedTermSchema } from './library.schema';

/**
 * Skill Schema (Instructional Module)
 * Represents "Procedural Knowledge" - How to do something.
 */

// 1. Instructional Context
export const InstructionalAndContextSchema = z.object({
    id: z.string().regex(/^[a-z0-9_]+$/),
    name: z.string(),
    objective: z.string().describe("Learning objective for the agent"),
    version: z.string().default("1.0.0"),

    // Dependencies
    required_tools: z.array(z.string()).describe("List of Tool IDs required"),
    required_context: z.array(z.string()).optional().describe("Paths to markdown docs to inject"),
});

// 2. Cognitive Workflow (The "Mental Model")
// We store this as raw Markdown strings to be parsed by the Interpreter, 
// OR as a parsed JSON structure if we strictly validate pre-compilation.
// For the Schema, we'll keep the raw markdown content to be validated by the Interpreter.
export const CognitiveWorkflowSchema = z.string().describe("Cognitive Markdown content");

// 3. Interpretation Rules (The "Glossary")
export const InterpretationRuleSchema = z.object({
    tool: z.string().describe("Tool ID triggering this rule"),
    output_pattern: z.string().describe("Regex or value match for tool output"),
    meaning: z.string().describe("Semantic meaning of this output"),
    instruction: z.string().describe("What the agent should do next"),
});

// 4. Quality Assurance (The "Exam")
export const EvaluationSpecSchema = z.object({
    golden_dataset: z.array(z.object({
        input: z.string().describe("Scenario input"),
        expected_workflow: z.array(z.string()).optional().describe("Sequence of expected Abstract Actions"),
        assert_not_touched: z.array(z.string()).optional(),
    })),
    guardrails: z.array(z.object({
        rule: z.string(),
        limit: z.any().optional(),
        action: z.enum(['Block', 'Force Re-Scan', 'RequestHumanReview']),
    })).optional(),
});

// MAIN SKILL OBJECT
export const SkillSchema = z.object({
    meta: InstructionalAndContextSchema,
    alignment: z.array(DefinedTermSchema).optional().describe("Ontology mappings"),

    // The Data
    procedure: z.string().describe("System Prompt / INSTRUCTIONS.md content"),
    workflow: CognitiveWorkflowSchema,
    interpretation: z.object({
        rules: z.array(InterpretationRuleSchema)
    }).optional(),

    evals: EvaluationSpecSchema.optional(),
});

export type Skill = z.infer<typeof SkillSchema>;
