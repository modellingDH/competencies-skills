import { z } from 'zod';

/**
 * Library & Ontology Schema
 * definitions for aligning with external ontologies (Schema.org, ESCO, CaSS).
 */

// Schema.org DefinedTerm
export const DefinedTermSchema = z.object({
    "@type": z.literal("DefinedTerm"),
    termCode: z.string().optional().describe("Unique code in the external taxonomy (e.g., ESCO Concept ID)"),
    name: z.string().describe("Name of the term in the external taxonomy"),
    url: z.string().url().describe("Permalink to the external definition"),
    inDefinedTermSet: z.string().url().describe("URL of the Taxonomy/Ontology (e.g. ESCO Skills)"),
});

export type DefinedTerm = z.infer<typeof DefinedTermSchema>;

// CaSS Framework / Domain Grouping
export const FrameworkSchema = z.object({
    id: z.string().uuid().or(z.string()),
    name: z.string().describe("Name of the Domain/Framework (e.g. Software Engineering)"),
    description: z.string(),
    competencies: z.array(z.string()).describe("List of Competency IDs included in this framework"),
});

export type Framework = z.infer<typeof FrameworkSchema>;
