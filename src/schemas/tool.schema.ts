import { z } from 'zod';

/**
 * Tool Schema
 * Represents an atomic capability (Function/API) that an agent can invoke.
 * Corresponds to "The Hands" of the agent.
 */
export const ToolSchema = z.object({
  id: z.string().uuid().or(z.string().regex(/^[a-z0-9_]+$/)).describe("Unique identifier for the tool"),
  name: z.string().min(1).describe("Human-readable name of the tool"),
  description: z.string().min(10).describe("Detailed description of what the tool does and when to use it"),
  
  // Alignment with Schema.org SoftwareSourceCode or APIReference
  source: z.object({
    type: z.enum(['local', 'api', 'library']),
    path: z.string().describe("Path to implementation file or API endpoint"),
    functionName: z.string().optional().describe("Exported function name if local"),
  }),

  // Parameters defined as a JSON Schema object for flexibility
  parameters: z.record(z.any()).describe("JSON Schema defining the input parameters"),
  
  // Security/Safety metadata
  safety: z.object({
    isDeterministic: z.boolean().default(true),
    sideEffects: z.boolean().default(false).describe("True if tool modifies state/db"),
    requiresApproval: z.boolean().default(false).describe("If true, requires Human-in-the-loop"),
  }).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
