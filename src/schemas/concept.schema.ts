import { z } from 'zod';

export const ConceptSchema = z.object({
    id: z.string().describe("Unique identifier for the concept (e.g., 'network_latency')"),
    name: z.string().describe("Human-readable name of the concept"),
    description: z.string().describe("Definition of the concept"),
    alignment: z.array(z.object({
        name: z.string().describe("Name of the external standard (e.g., 'Wikidata', 'ESCO')"),
        url: z.string().url().describe("URL to the external definition")
    })).optional().describe("Mappings to external ontologies"),
    related_to: z.array(z.string()).optional().describe("IDs of related concepts")
}).describe("A shared vocabulary term defining a domain concept, mapping to schema.org/DefinedTerm.");

export type Concept = z.infer<typeof ConceptSchema>;
