// Guidance data structured from AUTHORING_GUIDE.md
export interface GuidanceItem {
    type: 'do' | 'dont' | 'tip';
    text: string;
}

export interface StepGuidance {
    title: string;
    description: string;
    items: GuidanceItem[];
}

export const WIZARD_GUIDANCE: Record<string, StepGuidance> = {
    competency: {
        title: "Competencies Best Practices",
        description: "Competencies orchestrate multiple skills to achieve complex objectives.",
        items: [
            { type: 'do', text: 'Define a clear role or objective that combines multiple skills' },
            { type: 'do', text: 'Use behavior trees or sequences to orchestrate skill execution' },
            { type: 'do', text: 'Specify which skills are required for this competency' },
            { type: 'dont', text: 'Create competencies that only use a single skill' },
            { type: 'dont', text: 'Make competencies too broad or vague' },
            { type: 'tip', text: 'Think of competencies as "roles" like "Network Engineer" or "Data Analyst"' }
        ]
    },
    concept: {
        title: "Concepts Best Practices",
        description: "Concepts define shared vocabulary and domain terms for semantic consistency.",
        items: [
            { type: 'do', text: 'Map concepts to external ontologies (Wikidata, ESCO) using the alignment field' },
            { type: 'do', text: 'Use concepts to define the meaning of tool outputs in interpretation rules' },
            { type: 'do', text: 'Keep definitions clear and concise' },
            { type: 'dont', text: 'Redefine standard terms if an external definition exists' },
            { type: 'dont', text: 'Use Concepts for active instructions; they are static definitions' },
            { type: 'tip', text: 'Link related concepts to build a knowledge graph' }
        ]
    },
    skill: {
        title: "Skills Best Practices",
        description: "Skills should be atomic, focused, and actionable.",
        items: [
            { type: 'do', text: 'Use descriptive IDs that explain what the skill does' },
            { type: 'do', text: 'Write router-facing descriptions (when to use this skill)' },
            { type: 'do', text: 'Define clear decision points and actions in the workflow' },
            { type: 'do', text: 'Keep your main skill definition concise (under 800 lines)' },
            { type: 'do', text: 'Provide 2-3 canonical examples showing the thought process' },
            { type: 'dont', text: 'Make skills too broad or vague' },
            { type: 'dont', text: 'Forget to define failure states' },
            { type: 'dont', text: 'Overload context with entire codebases' },
            { type: 'tip', text: 'Use the toolbar buttons to insert cognitive workflow nodes' }
        ]
    },
    tool: {
        title: "Tools Best Practices",
        description: "Tools are atomic, deterministic capabilities exposed to agents.",
        items: [
            { type: 'do', text: 'Define clear input/output parameters' },
            { type: 'do', text: 'Specify whether the tool is deterministic' },
            { type: 'do', text: 'Document any side effects' },
            { type: 'dont', text: 'Create tools that are too complex or do multiple things' },
            { type: 'dont', text: 'Allow arbitrary code execution without sandboxing' },
            { type: 'tip', text: 'Think of tools as the "hands and eyes" of the agent' }
        ]
    }
};
