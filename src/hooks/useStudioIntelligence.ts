import { useState, useEffect, useRef } from 'react';
import type * as monaco from 'monaco-editor';
import { VERIFICATION_PROMPTS } from '@/services/verification_prompts';

// --- Types ---
export interface ProjectState {
    competencies?: Record<string, string>;
    skills?: Record<string, string>;
    concepts?: Record<string, string>;
    tools?: Record<string, string>;
}

export interface ValidationState {
    structure: { valid: boolean; errors: string[] };
    content: { valid: boolean; warnings: string[] };
    links: { valid: boolean; missing: string[]; broken: string[] };
    polish: { score: number; suggestions: string[] };
}

export interface SuggestedAction {
    id: string;
    label: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    stage: 'structure' | 'content' | 'links' | 'polish' | 'analysis';
    apply?: () => Promise<string | void>; // Returns new content or executes side-effect
}

// --- Validation Logic ---

function assessStructure(content: string): ValidationState['structure'] {
    const errors: string[] = [];

    // If suggestions are pending review, consider structure valid to unblock user
    if (content.includes(':::ai-suggestion')) {
        return { valid: true, errors: [] };
    }

    if (!content.trim()) errors.push("Document is empty");

    // Frontmatter Validation
    // Relaxed regex to handle whitespace/BOM at start and loose newlines
    const fmMatch = content.match(/^\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!fmMatch) {
        errors.push("Missing frontmatter block (start/end with ---)");
    } else {
        const fm = fmMatch[1] || '';
        // Allow optional indentation
        if (!/^\s*name:\s*.+$/m.test(fm)) errors.push("Missing 'name' in frontmatter");
        if (!/^\s*id:\s*.+$/m.test(fm)) errors.push("Missing 'id' in frontmatter");
    }
    if (!content.includes('## ROLE')) errors.push("Missing ## ROLE section");
    if (!content.includes('## OBJECTIVE')) errors.push("Missing ## OBJECTIVE section");
    if (content.split(/\s+/).length < 20 && content.length > 50) errors.push("Content is too short (< 20 words)"); // Relaxed check
    return { valid: errors.length === 0, errors };
}

function assessContent(content: string): ValidationState['content'] {
    const warnings: string[] = [];
    if (content.includes('TODO')) warnings.push("Contains TODO placeholders");

    // Check for vague or empty sections
    const bodyMatch = content.match(/## BODY[\s\S]*?(##|$)/);
    if (bodyMatch && bodyMatch[0].split(/\s+/).length < 10) {
        warnings.push("BODY section appears too brief — add procedural steps or detail.");
    }

    // Check for imperative verbs in step headings (numbered lists or bold headings)
    const steps = content.match(/^\d+\.\s+\*\*([a-z])/gm);
    if (steps && steps.length > 0) {
        warnings.push("Step headings should start with uppercase verbs (e.g. '1. **Validate**' not '1. **validate**').");
    }

    return { valid: warnings.length === 0, warnings };
}

function assessLinks(content: string, project: ProjectState): ValidationState['links'] {
    const missing: string[] = [];
    const broken: string[] = [];

    // Detect both old @type:id syntax and new markdown links [Name](/library/type/id)
    const oldLinkRegex = /@(competency|skill|concept|tool):(\w+)/g;
    const mdLinkRegex = /\[([^\]]+)\]\(\/library\/(competency|skill|concept|tool|meta-skill)\/(\w+)\)/g;
    let match;

    const validIds = new Set<string>();
    if (project) {
        Object.keys(project.competencies || {}).forEach(id => validIds.add(`competency:${id}`));
        Object.keys(project.skills || {}).forEach(id => validIds.add(`skill:${id}`));
        Object.keys(project.concepts || {}).forEach(id => validIds.add(`concept:${id}`));
        Object.keys(project.tools || {}).forEach(id => validIds.add(`tool:${id}`));
    }

    // Check old-style @type:id links (should be migrated)
    while ((match = oldLinkRegex.exec(content)) !== null) {
        const [, type, id] = match;
        const ref = `${type}:${id}`;
        if (!validIds.has(ref)) {
            broken.push(ref);
        }
    }

    // Check new-style markdown links
    while ((match = mdLinkRegex.exec(content)) !== null) {
        const [, , type, id] = match;
        const normalizedType = type === 'meta-skill' ? 'skill' : type;
        const ref = `${normalizedType}:${id}`;
        if (!validIds.has(ref)) {
            broken.push(ref);
        }
    }

    return { valid: missing.length === 0 && broken.length === 0, missing, broken };
}

// --- Hook ---

export function useStudioIntelligence(
    content: string,
    project: ProjectState | null | undefined,
    generate: (userPrompt: string, systemPrompt: string) => Promise<string | null>,
    isModelReady: boolean,
    getLibraryContext: () => string,
    createEntity?: (type: any, id: string, content: string) => void
) {
    const [markers, setMarkers] = useState<monaco.editor.IMarkerData[]>([]);
    const [validationState, setValidationState] = useState<ValidationState>({
        structure: { valid: false, errors: [] },
        content: { valid: false, warnings: [] },
        links: { valid: false, missing: [], broken: [] },
        polish: { score: 0, suggestions: [] }
    });
    const [suggestions, setSuggestions] = useState<SuggestedAction[]>([]);

    const processingRef = useRef(false);
    const contentRef = useRef(content);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        if (!isModelReady) return;

        const timer = setTimeout(() => {
            runFullValidation();
        }, 2000); // 2s debounce

        return () => clearTimeout(timer);
    }, [content, isModelReady, project]);

    const runFullValidation = async () => {
        if (processingRef.current || !project) return;
        processingRef.current = true;

        try {
            const currentContent = contentRef.current;
            const newMarkers: monaco.editor.IMarkerData[] = [];
            const llmWarnings: string[] = [];  // Collect LLM feedback

            // 1. Static Validation (Fast) -- SEQUENTIAL DEPENDENCY
            const struct = assessStructure(currentContent);

            let cont: ValidationState['content'] = { valid: false, warnings: [] };
            let lnks: ValidationState['links'] = { valid: false, missing: [], broken: [] };

            if (struct.valid) {
                cont = assessContent(currentContent);
            }

            if (struct.valid && cont.valid) {
                lnks = assessLinks(currentContent, project);
            }

            // Generate Markers from static analysis
            lnks.broken.forEach(brokenId => {
                // Find position (simplified)
                const idx = currentContent.indexOf(brokenId);
                if (idx !== -1) {
                    newMarkers.push({
                        startLineNumber: getLineNumber(currentContent, idx),
                        startColumn: getColumn(currentContent, idx),
                        endLineNumber: getLineNumber(currentContent, idx + brokenId.length),
                        endColumn: getColumn(currentContent, idx + brokenId.length),
                        message: "Broken link",
                        severity: 3
                    } as any);
                }
            });

            // 2. Identify Primary State Action
            const nextActions: SuggestedAction[] = [];

            // Strict priority: Structure -> Content -> Links -> Polish
            if (!struct.valid) {
                const isFix = currentContent.length < 50;
                nextActions.push({
                    id: isFix ? 'fix-structure' : 'suggest-structure',
                    label: isFix ? 'Generate Structure' : 'Review Structure',
                    description: isFix ? 'Generate missing sections.' : 'Review and accept structural changes.',
                    priority: 'critical',
                    stage: 'structure',
                    apply: async () => {
                        const libContext = getLibraryContext();
                        const prompt = (isFix
                            ? VERIFICATION_PROMPTS.structure.fix(currentContent)
                            : VERIFICATION_PROMPTS.structure.suggest(currentContent)) + `\n\nReference Context (Meta-Skills & Library):\n${libContext}`;

                        // If suggesting, we expect JSON
                        const res = await generate(prompt, isFix ? "You are an expert technical editor. Output ONLY the rewritten markdown." : "You are a coding assistant. Do NOT output markdown code blocks. Output ONLY valid JSON.");

                        if (!res) return;

                        if (!isFix) { // This block handles the 'suggest' case, expecting JSON
                            try {
                                // Parse JSON Suggestion
                                // Parse JSON Suggestion
                                const jsonMatch = res.match(/\{[\s\S]*\}/);
                                const jsonStr = jsonMatch ? jsonMatch[0] : res.replace(/```json/g, '').replace(/```/g, '').trim();
                                let analysis;
                                try {
                                    analysis = JSON.parse(jsonStr);
                                } catch (parseErr) {
                                    console.error("AI JSON Parse Error. Raw output:", res);
                                    return;
                                }

                                let newContent = currentContent;
                                const insertions: { pos: number, text: string, order: number }[] = [];

                                // 1. Frontmatter
                                const fmEndMatch = currentContent.match(/^---\s*\n[\s\S]*?\n(-{3})/);
                                let fmEndIndex = fmEndMatch ? (fmEndMatch.index! + fmEndMatch[0].length) : 0;

                                if (analysis.frontmatter?.missing && analysis.frontmatter.fix) {
                                    // Strip existing dashes if AI added them
                                    const cleanFm = analysis.frontmatter.fix.replace(/^-{3}\s*[\r\n]+/, '').replace(/[\r\n]+-{3}\s*$/, '').trim();
                                    if (!fmEndMatch) {
                                        // Insert at top
                                        insertions.push({ pos: 0, text: `:::ai-suggestion\n---\n${cleanFm}\n---\n:::\n\n`, order: 1 });
                                    } else {
                                        // Insert fields inside
                                        const splitPos = fmEndMatch.index! + fmEndMatch[0].lastIndexOf('---');
                                        insertions.push({ pos: splitPos, text: `\n:::ai-suggestion\n${analysis.frontmatter.fix}\n:::`, order: 1 });
                                    }
                                }

                                // 2. Role
                                if (analysis.role?.missing) {
                                    // Insert after frontmatter
                                    insertions.push({ pos: fmEndIndex, text: `\n\n:::ai-suggestion\n${analysis.role.fix}\n:::`, order: 2 });
                                }

                                // 3. Objective
                                if (analysis.objective?.missing) {
                                    // If Role was missing, we insert at fmEndIndex (after role via order)
                                    // If Role exists, try to find end of it?
                                    // For simplicity, failing to find "End of Role", we insert after Role start + paragraph?
                                    // Or just append to document if Role exists? 
                                    // Safe bet: Insert at fmEndIndex (after Role if also inserted).
                                    // If Role exists, we might prepend Objective before it? No.
                                    // If Role exists, we want Objective AFTER it.

                                    let objPos = fmEndIndex;
                                    const roleMatch = currentContent.match(/^##\s+ROLE/m);
                                    if (roleMatch && !analysis.role?.missing) {
                                        // Role exists. Find next section or end.
                                        const nextHeader = currentContent.slice(roleMatch.index! + 10).match(/^##\s+/m);
                                        if (nextHeader) {
                                            objPos = roleMatch.index! + 10 + nextHeader.index!;
                                        } else {
                                            objPos = currentContent.length;
                                        }
                                    }
                                    insertions.push({ pos: objPos, text: `\n\n:::ai-suggestion\n${analysis.objective.fix}\n:::`, order: 3 });
                                }

                                // Apply insertions descending by position.
                                // If positions are equal, apply by order DESCENDING (3, 2, 1) to ensure proper stacking order at insertion point.
                                // (Insert 2 then 1 at pos 0 results in 1 before 2)
                                insertions.sort((a, b) => {
                                    if (a.pos !== b.pos) return b.pos - a.pos;
                                    return b.order - a.order;
                                });

                                for (const ins of insertions) {
                                    newContent = newContent.slice(0, ins.pos) + ins.text + newContent.slice(ins.pos);
                                }
                                return newContent;

                            } catch (e) {
                                console.error("Failed to parse structure suggestion", e);
                                return undefined;
                            }
                        }

                        return res;
                    }
                });
            } else if (!cont.valid) {
                nextActions.push({
                    id: 'fix-content',
                    label: 'Revise Content',
                    description: 'Improve clarity and fix formatting issues.',
                    priority: 'high',
                    stage: 'content',
                    apply: async () => {
                        const prompt = VERIFICATION_PROMPTS.content.fix(currentContent);
                        const res = await generate(prompt, "You are an expert technical editor. Output ONLY the rewritten markdown.");
                        return res || undefined;
                    }
                });
            } else if (!lnks.valid) {
                // Link validation failed (broken links)
                if (lnks.broken.length > 0 && createEntity) {
                    nextActions.push({
                        id: 'define-missing',
                        label: 'Define Missing Entities',
                        description: `Create definitions for ${lnks.broken.length} missing entities.`,
                        priority: 'high',
                        stage: 'links',
                        apply: async () => {
                            // Create stubs for all broken links
                            lnks.broken.forEach(ref => {
                                const [type, id] = ref.split(':');
                                if (type && id) {
                                    createEntity(type, id, `name: ${id}\n\n(Stub created by validation)`);
                                }
                            });
                            return; // Side effect only
                        }
                    });
                }
            }

            // 3. LLM Validation (Slow / progressive)
            // 3. LLM Validation (Connectivity & Polish)
            // Only run if previous stages passed
            if (struct.valid && cont.valid && lnks.valid && currentContent.length > 50) {

                // Check for orphans
                // Provide known IDs to prompt
                let knownIds: string[] = [];
                if (project) {
                    knownIds = [
                        ...Object.keys(project.skills || {}).map(id => `skill/${id}`),
                        ...Object.keys(project.tools || {}).map(id => `tool/${id}`),
                        ...Object.keys(project.concepts || {}).map(id => `concept/${id}`)
                    ];
                }

                // Only run if we have known IDs to check against
                if (knownIds.length > 0) {
                    nextActions.push({
                        id: 'auto-link',
                        label: 'Auto-Link Entities',
                        description: 'Detect and link terms to known entities.',
                        priority: 'medium',
                        stage: 'links',
                        apply: async () => {
                            const prompt = VERIFICATION_PROMPTS.connectivity.fix(currentContent, knownIds);
                            const res = await generate(prompt, "You are an expert technical editor. Output ONLY the rewritten markdown.");
                            return res || undefined;
                        }
                    });
                }

                // Polish Check (Stage 4)
                try {
                    // Use imported prompt
                    const result = await generate(
                        VERIFICATION_PROMPTS.polish.user(currentContent),
                        VERIFICATION_PROMPTS.polish.system
                    );

                    if (result) {
                        const jsonMatch = result.match(/\{[\s\S]*\}/); // flexible JSON match
                        if (jsonMatch) {
                            try {
                                const analysis = JSON.parse(jsonMatch[0]);
                                if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
                                    llmWarnings.push(...analysis.suggestions);
                                }
                                // Store improved content somewhere? Ideally inside action apply
                            } catch (e) {
                                console.warn("Failed to parse LLM JSON", e);
                            }
                        }
                    }

                    if (llmWarnings.length > 0) {
                        nextActions.push({
                            id: 'polish',
                            label: 'Polish Content',
                            description: `Fix ${llmWarnings.length} style issues detected by AI.`,
                            priority: 'medium',
                            stage: 'polish',
                            apply: async () => {
                                const res = await generate(
                                    `Rewrite this content to fix the following issues: ${llmWarnings.join('; ')}\n\n${currentContent}`,
                                    "You are an expert technical editor. Output ONLY the rewritten markdown."
                                );
                                return res || undefined;
                            }
                        });
                    }

                } catch (e) {
                    console.warn("LLM Polish failed", e);
                }
            }

            setValidationState({
                structure: struct,
                content: cont,
                links: lnks,
                polish: {
                    score: llmWarnings.length > 0 ? 50 : 100,
                    suggestions: llmWarnings
                }
            });
            setMarkers(newMarkers);
            setSuggestions(nextActions);
        } catch (error) {
            console.error("Validation error:", error);
        } finally {
            processingRef.current = false;
        }
    };

    // 4. Proactive AI Analysis (Debounced)
    useEffect(() => {
        if (!isModelReady || !content || content.length < 10) return;

        const timer = setTimeout(async () => {
            try {
                const libCtx = getLibraryContext();
                const systemPrompt = `You are a Studio Writing Assistant.
Analyze the user's draft skill based on:
1. Skill Definition Structure (ROLE, OBJECTIVE, BODY)
2. Writing Best Practices (Coaching Logic)

Use the Library Context to inform your analysis.

Current Content:
${content}

Task:
Identify the single most helpful next step for the user.
Output valid JSON only:
{
  "label": "Short Title (e.g. Add Role)",
  "description": "1 clear sentence explaining why this step is needed.",
  "action_type": "structure" | "content" | "refine",
  "suggestion_text": "The actual text content to insert or use. If suggests structure, provide the markdown block. If specific advice, provide the text."
}`;

                const res = await generate("Analyze draft and suggest next step.", systemPrompt);
                if (res) {
                    // Clean JSON
                    const jsonStr = res.replace(/```json/g, '').replace(/```/g, '').trim();
                    const json = JSON.parse(jsonStr);

                    if (json.label) {
                        const newSuggestion: SuggestedAction = {
                            id: 'ai-proactive-' + Date.now(),
                            label: `💡 ${json.label}`,
                            description: json.description,
                            priority: 'high', // Proactive suggestions are high priority
                            stage: 'analysis',
                            apply: async () => {
                                return json.suggestion_text || json.description;
                            }
                        };

                        setSuggestions(prev => {
                            // Remove previous proactive suggestions to avoid clutter
                            const others = prev.filter(p => !p.id.startsWith('ai-proactive-'));
                            return [newSuggestion, ...others];
                        });
                    }
                }
            } catch (e) {
                // Silent failure for auto-analysis
                console.warn("Auto-analysis skipped/failed", e);
            }
        }, 4000); // 4s debounce to avoid too many calls

        return () => clearTimeout(timer);
    }, [content, isModelReady]);

    return {
        markers,
        validationState,
        suggestions
    };
}

// Helpers
function getLineNumber(text: string, index: number) {
    return text.substring(0, index).split('\n').length;
}

function getColumn(text: string, index: number) {
    const lines = text.substring(0, index).split('\n');
    return (lines[lines.length - 1]?.length || 0) + 1;
}
