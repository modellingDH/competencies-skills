import { z } from 'zod';
import { DefinedTermSchema } from './library.schema';

/**
 * Competency Schema (The Orchestrator)
 * Represents a high-level role or job function (e.g., "Warehouse Manager").
 * Orchestrates multiple Skills using a Behavior Tree logic.
 */

// Behavior Tree Nodes
const BehaviorNodeSchema = z.lazy(() => z.object({
    type: z.enum(['Sequence', 'Selector', 'Parallel', 'Action', 'Condition']),
    name: z.string().optional(),

    // For Composites (Sequence, Selector, Parallel)
    children: z.array(BehaviorNodeSchema).optional(),

    // For Actions (Leaf Nodes)
    skill_ref: z.string().optional().describe("ID of the Skill to execute"),
    parameters: z.record(z.any()).optional().describe("Parameters to pass to the Skill"),

    // For Conditions
    condition: z.string().optional().describe("Expression to evaluate (e.g. 'battery < 20')"),
}));

export const CompetencySchema = z.object({
    id: z.string().uuid().or(z.string().regex(/^[a-z0-9_]+$/)),
    name: z.string().describe("Role name (e.g. 'Warehouse Manager')"),
    description: z.string(),

    // Ontology Alignment (e.g. Map to an ESCO Occupation)
    alignment: z.array(DefinedTermSchema).optional(),

    // Dependencies
    skills: z.array(z.string()).describe("List of Skill IDs managed by this Competency"),

    // The Logic
    orchestration: BehaviorNodeSchema.describe("Root node of the Behavior Tree"),

    // Context
    constraints: z.array(z.string()).optional().describe("Global constraints (e.g. 'Never run safely check > 1s')"),
});

export type Competency = z.infer<typeof CompetencySchema>;
export type BehaviorNode = z.infer<typeof BehaviorNodeSchema>;
