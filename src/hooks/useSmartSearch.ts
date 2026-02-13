'use client';

import { useState, useCallback, useRef } from 'react';

// --- Types ---

export type SearchIntent = 'find' | 'create' | 'list' | 'generate';

export interface SmartSearchResult {
    intent: SearchIntent;
    /** AI-generated suggestion text (e.g. "Create a skill for PR review?") */
    aiSuggestion: string | null;
    /** If intent is 'create', proposed entity details */
    createProposal: {
        name: string;
        type: string;
        id: string;
    } | null;
    /** If intent is 'generate', a list of proposed entities */
    generateList: Array<{
        name: string;
        type: string;
        id: string;
        description: string;
    }> | null;
    /** Is the AI currently processing */
    isProcessing: boolean;
}

// --- Intent Detection (local, no AI) ---

const CREATE_PATTERNS = [
    /^(create|make|add|new|build|define|write)\b/i,
    /\b(need|want) (?:a |an |to create )/i,
    /\bfor (?:a |an )?new\b/i,
];

const LIST_PATTERNS = [
    /^(list|show|give me|what are|all)\b/i,
    /\brelated to\b/i,
    /\bskills? (?:for|about|related)\b/i,
];

const GENERATE_PATTERNS = [
    /^(generate|produce|scaffold|bootstrap)\b/i,
    /\bgenerate (?:a |an )?(?:set|list|bundle|collection)\b/i,
    /\bskills? (?:set|pack|bundle|collection) for\b/i,
];

function detectIntent(query: string): SearchIntent {
    const q = query.trim();
    if (!q) return 'find';

    for (const p of GENERATE_PATTERNS) {
        if (p.test(q)) return 'generate';
    }
    for (const p of CREATE_PATTERNS) {
        if (p.test(q)) return 'create';
    }
    for (const p of LIST_PATTERNS) {
        if (p.test(q)) return 'list';
    }
    return 'find';
}

// --- Slug helper ---
function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// --- Hook ---

export function useSmartSearch(
    generate: (prompt: string, systemPrompt: string) => Promise<string>,
    isModelReady: boolean
) {
    const [result, setResult] = useState<SmartSearchResult>({
        intent: 'find',
        aiSuggestion: null,
        createProposal: null,
        generateList: null,
        isProcessing: false,
    });

    const abortRef = useRef(false);
    const lastQueryRef = useRef('');

    const analyzeQuery = useCallback(async (
        query: string,
        fuseResultCount: number,
        entityNames: string[]
    ) => {
        lastQueryRef.current = query;
        const trimmed = query.trim();

        if (!trimmed || trimmed.length < 3) {
            setResult({
                intent: 'find',
                aiSuggestion: null,
                createProposal: null,
                generateList: null,
                isProcessing: false,
            });
            return;
        }

        const intent = detectIntent(trimmed);

        // For 'create' intent, immediately propose without AI
        if (intent === 'create') {
            const stripped = trimmed
                .replace(/^(create|make|add|new|build|define|write)\s+/i, '')
                .replace(/^(a |an )/i, '')
                .replace(/\bskill\b/i, '')
                .replace(/\bfor\b/i, '')
                .trim();
            const name = stripped || trimmed;
            setResult({
                intent: 'create',
                aiSuggestion: `Create "${name}" as a new entity?`,
                createProposal: {
                    name,
                    type: 'skill',
                    id: toSlug(name),
                },
                generateList: null,
                isProcessing: false,
            });
            return;
        }

        // For 'find' with few/no results, offer create suggestion
        if (intent === 'find' && fuseResultCount <= 1) {
            setResult({
                intent: 'find',
                aiSuggestion: fuseResultCount === 0
                    ? `No matches found. Create "${trimmed}" as a new skill?`
                    : null,
                createProposal: fuseResultCount === 0 ? {
                    name: trimmed,
                    type: 'skill',
                    id: toSlug(trimmed),
                } : null,
                generateList: null,
                isProcessing: false,
            });

            // If model ready and zero results, try AI semantic matching
            if (fuseResultCount === 0 && isModelReady && entityNames.length > 0) {
                setResult(prev => ({ ...prev, isProcessing: true }));
                abortRef.current = false;

                try {
                    const res = await generate(
                        `The user searched for: "${trimmed}"

Available entities in the library:
${entityNames.slice(0, 50).join(', ')}

Which of these entities (if any) are semantically relevant to the user's search? List them.
If none are relevant, suggest what kind of entity (skill, concept, tool) the user might want to create.

Output ONLY valid JSON:
{
  "matches": ["entity_name_1", "entity_name_2"],
  "create_suggestion": "string or null"
}`,
                        'You are a library search assistant. Output ONLY valid JSON, no markdown.'
                    );

                    if (abortRef.current || lastQueryRef.current !== query) return;

                    const jsonMatch = res?.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        const suggestion = parsed.matches?.length > 0
                            ? `Did you mean: ${parsed.matches.join(', ')}?`
                            : parsed.create_suggestion || `Create "${trimmed}" as a new skill?`;

                        setResult(prev => ({
                            ...prev,
                            aiSuggestion: suggestion,
                            isProcessing: false,
                        }));
                    }
                } catch {
                    if (!abortRef.current) {
                        setResult(prev => ({ ...prev, isProcessing: false }));
                    }
                }
            }
            return;
        }

        // For 'generate' intent, use AI to produce a list
        if (intent === 'generate' && isModelReady) {
            setResult({
                intent: 'generate',
                aiSuggestion: 'Generating skill set...',
                createProposal: null,
                generateList: null,
                isProcessing: true,
            });
            abortRef.current = false;

            try {
                const topic = trimmed
                    .replace(/^(generate|produce|scaffold|bootstrap)\s+/i, '')
                    .replace(/^(a |an )?(?:set|list|bundle|collection)?\s*(of\s+)?/i, '')
                    .replace(/^skills?\s*(for|about|on)?\s*/i, '')
                    .trim();

                const res = await generate(
                    `Generate a set of 5-8 professional skills for: "${topic}"

Each skill should have a clear name, snake_case id, type (skill/concept/tool), and a one-line description.

Output ONLY valid JSON:
{
  "skills": [
    { "name": "Skill Name", "type": "skill", "id": "snake_case_id", "description": "One line description" }
  ]
}`,
                    'You are a professional skill architect. Output ONLY valid JSON, no markdown code blocks.'
                );

                if (abortRef.current || lastQueryRef.current !== query) return;

                const jsonMatch = res?.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setResult({
                        intent: 'generate',
                        aiSuggestion: `Generated ${parsed.skills?.length || 0} skills for "${topic}"`,
                        createProposal: null,
                        generateList: parsed.skills || [],
                        isProcessing: false,
                    });
                }
            } catch {
                if (!abortRef.current) {
                    setResult(prev => ({
                        ...prev,
                        aiSuggestion: 'Failed to generate skills. Try rephrasing.',
                        isProcessing: false,
                    }));
                }
            }
            return;
        }

        // For 'list' intent, just set the intent (Fuse handles filtering)
        setResult({
            intent,
            aiSuggestion: null,
            createProposal: null,
            generateList: null,
            isProcessing: false,
        });
    }, [generate, isModelReady]);

    const reset = useCallback(() => {
        abortRef.current = true;
        setResult({
            intent: 'find',
            aiSuggestion: null,
            createProposal: null,
            generateList: null,
            isProcessing: false,
        });
    }, []);

    return { smartResult: result, analyzeQuery, resetSmartSearch: reset };
}
