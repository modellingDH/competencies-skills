import { z } from 'zod';

/**
 * Meta-Reasoning Schema (The Strategist)
 * Defines policies for selecting the right Skill or Competency based on user intent and context.
 */

export const SelectionRuleSchema = z.object({
    name: z.string(),
    condition: z.string().describe("Condition Query (e.g., 'user_intent == sort_data')"),
    priority: z.number().default(1),

    // The Target
    target_type: z.enum(['Skill', 'Competency']),
    target_id: z.string(),

    // Explanation (CoT)
    reasoning: z.string().describe("Why this skill fits this condition (for introspection)"),
});

export const ValidationPolicySchema = z.object({
    trigger: z.enum(['Pre-Execution', 'Post-Execution', 'On-Error']),
    action: z.string().describe("Action to take (e.g. 'Run Validations', 'Retry')"),
});

export const MetaSchema = z.object({
    policy_id: z.string(),
    domain: z.string().describe("Applicable domain (e.g. 'SoftwareEngineering')"),

    // Router Logic
    selection_rules: z.array(SelectionRuleSchema),

    // Self-Correction Logic
    validation_policies: z.array(ValidationPolicySchema).optional(),
});

export type MetaPolicy = z.infer<typeof MetaSchema>;
