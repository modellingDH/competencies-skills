'use client';

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GitHubIcon from '@mui/icons-material/GitHub';
import AddLinkIcon from '@mui/icons-material/AddLink';
import LinkIcon from '@mui/icons-material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import { CognitiveMonacoEditor } from './CognitiveMonacoEditor';
import Link from 'next/link';
import { useWizard } from './WizardContext';
import { useAI } from '@/contexts/AIContext';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';


import type { SuggestedAction } from '@/hooks/useStudioIntelligence';

interface EntityEditorProps {
    type: 'competency' | 'concept' | 'skill' | 'tool';
    id: string;
    onOpenGuidance?: (() => void) | null;
}

export function getDefaultTemplate(entityType: string): string {
    switch (entityType) {
        case 'competency':
            return `## ROLE
Define the agent's role (e.g., Network Engineer, Data Analyst)

## OBJECTIVE  
What should this competency achieve?

## GUARDRAILS
- Never do X
- Always verify Y
- Escalate if Z

## Required Skills
- [Example Skill](/library/skill/example_skill_id)`;

        case 'concept':
            return `## Definition
Define this concept clearly and concisely.

## Alignment
**External Reference**: [Wikidata/ESCO](https://example.com)

## Related Concepts
- [Related Concept](/library/concept/related_concept_id)`;

        case 'skill':
            return `**Description**: When should the agent use this skill?

## Procedure

1. **Check prerequisites** — verify input is available.
2. **Execute** — perform the main action.
3. **Decide** — check if the result meets expectations.
   - **If yes** → continue to the next step.
   - **If no** → stop and escalate.

## Required Tools
- [Example Tool](/library/tool/example_tool_id)`;

        case 'tool':
            return `## Description
What does this tool do?

## Parameters

### Input
- param1: description
- param2: description

### Output
- result: description

**Deterministic**: Yes

## Side Effects
- None (or list side effects if any)`;

        default:
            return '';
    }
}

export function EntityEditor({ type, id, onOpenGuidance }: EntityEditorProps) {
    const { project, updateProject, githubUser, driveUser, setSaveStatus, setLastSaved } = useWizard();
    const { generate, isModelReady } = useAI();

    // Get existing content or initialize with template
    const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
    const collection = (project[collectionKey as keyof typeof project] as Record<string, string>) || {};
    const existingContent = (collection[id] || '');
    const defaultTemplate = getDefaultTemplate(type);

    const [name, setName] = useState(id.replace(/_/g, ' '));
    const [content, setContent] = useState(existingContent || defaultTemplate);
    // lastSaved managed globally now
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedContentRef = useRef<string>(existingContent || defaultTemplate);
    const differenceThreshold = 10; // Chars

    const activeIdRef = useRef(id);
    activeIdRef.current = id;

    // Help Overlay

    const [currentSuggestion, setCurrentSuggestion] = useState<SuggestedAction | null>(null);

    const handleSmartAction = async () => {
        if (!currentSuggestion) return;
        setIsGenerating(true);
        try {
            const result = await currentSuggestion.apply?.();
            if (typeof result === 'string') {
                setContent(result);
            }
        } catch (e) {
            console.error("Action failed", e);
        } finally {
            setIsGenerating(false);
        }
    };



    const handleSuggestStructure = async () => {
        const generationId = id;
        setIsGenerating(true);
        try {
            const systemPrompt = "You are an expert technical writer. Output ONLY the requested markdown structure. Do not include conversational text.";
            let userPrompt = "";

            switch (type) {
                case 'competency':
                    userPrompt = `Create a Competency skeleton for "${name}". Return markdown with headers: ## ROLE, ## OBJECTIVE, ## GUARDRAILS, ## Required Skills. Add comment placeholders like <!-- details here -->.`;
                    break;
                case 'concept':
                    userPrompt = `Create a Concept definition skeleton for "${name}". Return markdown with headers: ## Definition, ## Alignment, ## Related Concepts.`;
                    break;
                case 'skill':
                    userPrompt = `Create a Cognitive Skill skeleton for "${name}". Return markdown with headers: ## Description, # Cognitive Workflow, ## Required Tools.`;
                    break;
                case 'tool':
                    userPrompt = `Create a Tool definition skeleton for "${name}". Return markdown with headers: ## Description, ## Parameters, ## Side Effects.`;
                    break;
            }

            if (userPrompt) {
                const result = await generate(userPrompt, systemPrompt);

                let finalContent = "";
                if (result && !result.includes("I understand") && !result.includes("Here is")) {
                    finalContent = result;
                } else if (result) {
                    const cleanResult = result.replace(/^.*?(?=#)/s, '');
                    finalContent = cleanResult || result;
                }

                if (finalContent) {
                    if (generationId === activeIdRef.current) {
                        setContent(finalContent);
                    } else {
                        // Background update
                        const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
                        updateProject(prev => {
                            const col = (prev[collectionKey as keyof typeof prev] as Record<string, string>) || {};
                            const current = col[generationId] || '';
                            // Conflict check: if content changed significantly from the content that initiated the AI request,
                            // append the AI result instead of overwriting.
                            // A length check (e.g., > 20 chars) helps avoid appending to nearly empty content,
                            // which is common for structure suggestions.
                            if (current.trim() !== content.trim() && current.length > 20) {
                                return {
                                    ...prev,
                                    [collectionKey]: {
                                        ...col,
                                        [generationId]: current + '\n\n## AI Suggested Structure (Conflict)\n' + finalContent
                                    }
                                };
                            }
                            return {
                                ...prev,
                                [collectionKey]: {
                                    ...col,
                                    [generationId]: finalContent
                                }
                            };
                        });
                        console.log(`Background update for ${type}:${generationId}`);
                    }
                }
            }
        } catch (e) {
            console.error("Auto-draft failed", e);
        } finally {
            if (activeIdRef.current === generationId) setIsGenerating(false);
        }
    };

    const handleSuggestConnections = async () => {
        const generationId = id;
        setIsGenerating(true);
        try {
            // Gather available entities summary
            const summaries: string[] = [];
            const types = ['competency', 'skill', 'concept', 'tool'] as const;

            types.forEach(t => {
                const key = t === 'competency' ? 'competencies' : `${t}s`;
                const collection = project[key as keyof typeof project] as Record<string, string>;
                if (collection) {
                    Object.entries(collection).forEach(([k, v]) => {
                        // extract name from v if possible, else k
                        summaries.push(`- @${t}:${k}`);
                    });
                }
            });

            const systemPrompt = "You are an expert cognitive system architect. Analyze the content and the list of available entities. Suggest relevant entities to link using @type:id syntax. Also suggest logical next steps or missing fields. Output a markdown list of specific suggestions.";

            // Limit summaries to avoid context overflow if huge?
            // For now assume manageable size.
            const contextList = summaries.slice(0, 200).join('\n');

            const userPrompt = `Current Content:\n${content}\n\nAvailable Library Entities:\n${contextList}\n\nBased on the content, which existing entities should be linked? Are there missing connections? Provide a '## AI Suggestions' section with specific links.`;

            const result = await generate(userPrompt, systemPrompt);

            if (result) {
                const appendText = result.startsWith('#') ? ('\n\n' + result) : ('\n\n## AI Suggestions\n' + result);

                if (generationId === activeIdRef.current) {
                    setContent(prev => prev + appendText);
                } else {
                    // Background update
                    const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
                    updateProject(prev => {
                        const col = prev[collectionKey as keyof typeof prev] as Record<string, string>;
                        const oldContent = col[generationId] || '';
                        return {
                            ...prev,
                            [collectionKey]: {
                                ...col,
                                [generationId]: oldContent + appendText
                            }
                        };
                    });
                    console.log(`Background update for ${type}:${generationId}`);
                }
            }

        } catch (e) {
            console.error("Auto-connect failed", e);
        } finally {
            if (activeIdRef.current === generationId) setIsGenerating(false);
        }
    };

    const handleAutoLink = async () => {
        const generationId = id;
        setIsGenerating(true);
        try {
            // Gather available entities summary
            const summaries: string[] = [];
            const types = ['competency', 'skill', 'concept', 'tool'] as const;

            types.forEach(t => {
                const key = t === 'competency' ? 'competencies' : `${t}s`;
                const collection = project[key as keyof typeof project] as Record<string, string>;
                if (collection) {
                    Object.entries(collection).forEach(([k, v]) => {
                        // Extract name or use ID
                        let name = k.replace(/_/g, ' ');
                        const match = v.match(/^name:\s*(.*)$/m);
                        if (match && match[1]) name = match[1];
                        summaries.push(`- ${name} (ID: @${t}:${k})`);
                    });
                }
            });

            const systemPrompt = "You are an expert technical editor. Read the content and the list of available entities. Identify textual mentions of these entities (even if phrased slightly differently) and replace them with the correct '@type:id' link syntax. Do not remove any content, only link entities. Output ONLY the updated markdown content.";

            const contextList = summaries.slice(0, 300).join('\n');

            const userPrompt = `Content:\n${content}\n\nAvailable Entities:\n${contextList}\n\nRewrite the content detecting and linking entities.`;

            const result = await generate(userPrompt, systemPrompt);

            if (result) {
                // Heuristic: if result is much shorter, it might have failed.
                const isValid = result.length > content.length * 0.5;
                if (isValid) {
                    if (generationId === activeIdRef.current) {
                        setContent(result);
                    } else {
                        // Background update
                        const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
                        updateProject(prev => {
                            const col = (prev[collectionKey as keyof typeof prev] as Record<string, string>) || {};
                            const current = col[generationId] || '';
                            // Conflict check for rewrite
                            if (current.trim() !== content.trim()) {
                                return {
                                    ...prev,
                                    [collectionKey]: {
                                        ...col,
                                        [generationId]: current + '\n\n## Auto-Link Result (Conflict)\n' + result
                                    }
                                };
                            }
                            return {
                                ...prev,
                                [collectionKey]: {
                                    ...col,
                                    [generationId]: result
                                }
                            };
                        });
                        console.log(`Background update for ${type}:${generationId}`);
                    }
                }
            }

        } catch (e) {
            console.error("Auto-link failed", e);
        } finally {
            if (activeIdRef.current === generationId) setIsGenerating(false);
        }
    };

    // Auto-drafting for new/empty entities
    useEffect(() => {
        if (!isModelReady || !name || content !== defaultTemplate) return;

        // Short delay to ensure mount is stable
        const draftTimeout = setTimeout(() => {
            // Double check content hasn't changed significantly from default
            if (content !== defaultTemplate && content.length > differenceThreshold) return;

            console.log("Auto-drafting skeleton for:", name);
            handleSuggestStructure();
        }, 1500);

        return () => clearTimeout(draftTimeout);
    }, [isModelReady, name, type, defaultTemplate]); // Run once when model ready or name changes (initially)

    // Update content when entity changes
    useEffect(() => {
        const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
        const collection = (project[collectionKey as keyof typeof project] as Record<string, string>) || {};
        const fullContent = (collection[id] || '');

        // Regex to match frontmatter (yaml block at start)
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
        const match = fullContent.match(frontmatterRegex);

        let initialBody = fullContent;
        let initialName = id.replace(/_/g, ' ');

        if (match) {
            // Strip frontmatter
            initialBody = fullContent.slice(match[0].length);

            // Try to extract name from frontmatter
            const nameMatch = (match[1] || '').match(/^name:\s*(.*)$/m);
            if (nameMatch) {
                initialName = (nameMatch[1] || '').trim();
            }
        } else if (!fullContent) {
            // New/Empty entity - load template
            initialBody = getDefaultTemplate(type);
        }

        setContent(initialBody);
        setName(initialName);
        lastSavedContentRef.current = initialBody; // Sync ref
        setLastSaved(null); // Reset global save status logic?
        setSaveStatus('saved');
        setIsGenerating(false); // Reset AI state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id]); // Only reload when switching entities. Ignore project updates to prevent loops.

    // Autosave with debounce
    useEffect(() => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for autosave (2 seconds after last change)
        // Check if content actually changed
        if (content !== lastSavedContentRef.current) {
            setSaveStatus('idle');
            saveTimeoutRef.current = setTimeout(() => {
                handleSave();
            }, 1000);
        } else {
            setSaveStatus('saved');
        }

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                handleSave(); // Force immediate save on unmount/re-render
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, content, setSaveStatus]); // Re-run when name or content changes


    const handlePublish = async () => {
        if (!githubUser || !window.electronAPI) return;

        if (!confirm("About to publish/update this skill on GitHub Gist.\n\nThis action cannot be undone (history is preserved on GitHub).\n\nDo you want to proceed?")) return;

        setIsPublishing(true);
        try {
            // Parse frontmatter for gist_id
            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
            const match = content.match(frontmatterRegex);
            let gistId = null;

            if (match && match[1]) {
                const idMatch = match[1].match(/^gist_id:\s*(.*)$/m);
                if (idMatch && idMatch[1]) gistId = idMatch[1].trim();
            }

            let newUrl: string | null = null;
            const description = `Cognitive Library: ${type} - ${name}`;

            if (gistId) {
                newUrl = await window.electronAPI!.updateGitHubGist({
                    gistId,
                    name,
                    content,
                    description
                });
            } else {
                newUrl = await window.electronAPI!.createGitHubGist({
                    name,
                    content,
                    description
                });
            }

            if (newUrl) {
                const newId = newUrl.split('/').pop();
                // Check if newId is different (should allow setting it initially)
                if (newId) {
                    let newContent = content;
                    if (match) {
                        // If it has frontmatter
                        if (!gistId) {
                            // Append if new
                            newContent = content.replace(/^---\n([\s\S]*?)\n---/, (m, p1) => {
                                return `---\n${p1.trim()}\ngist_id: ${newId}\ngist_url: ${newUrl}\n---`;
                            });
                        } else {
                            // Already has ID, assuming it's the same. Update URL just in case?
                            // Skip modifying content if ID matches.
                        }
                    } else {
                        newContent = `---\nid: ${id}\nname: ${name}\ngist_id: ${newId}\ngist_url: ${newUrl}\n---\n\n${content}`;
                    }
                    if (newContent !== content) setContent(newContent);
                }
                alert(`Successfully published to Gist: ${newUrl}`);
            } else {
                alert('Failed to publish. Please check your GitHub connection.');
            }

        } catch (error) {
            console.error('Publishing failed:', error);
            alert('Publishing exception occurred.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSave = () => {
        // Double check dirty
        if (content === lastSavedContentRef.current) {
            setSaveStatus('saved');
            return;
        }

        const markdown = `---
id: ${id}
name: ${name}
---

${content}`;

        const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
        updateProject((prev) => ({
            ...prev,
            [collectionKey]: {
                ...(prev[collectionKey as keyof typeof prev] as Record<string, string>),
                [id]: markdown
            }
        }));

        lastSavedContentRef.current = content; // Update ref
        setSaveStatus('saving');

        // Simulate short delay or just set saved?
        if (driveUser && window.electronAPI && window.electronAPI.saveToDrive) {
            window.electronAPI.saveToDrive({ type, id, content }).catch(err => console.error("Drive auto-save failed", err));
        }

        setTimeout(() => {
            setSaveStatus('saved');
            setLastSaved(new Date());
        }, 800);
    };

    const getEditorConfig = () => {
        switch (type) {
            case 'competency':
                return {
                    title: 'Edit Competency',
                    hint: 'Use ## ROLE, ## OBJECTIVE, ## GUARDRAILS sections. Supports lists (-), bold (**text**), and [links](/library/type/id).',
                    categories: ['markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'concept':
                return {
                    title: 'Edit Concept',
                    hint: 'Define concept. Supports headers (##), links ([text](url)), and entity references.',
                    categories: ['markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'skill':
                return {
                    title: 'Edit Skill',
                    hint: 'Write clear steps with numbered lists and bold headings. Supports code blocks, lists, links.',
                    categories: ['markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'tool':
                return {
                    title: 'Edit Tool',
                    hint: 'Document parameters using lists (-), bold (**), code (`).',
                    categories: ['cognitive', 'markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            default:
                return {
                    title: 'Edit Entity',
                    hint: 'Formatting: Lists (-), Bold (**), Headers (##). Click for more.',
                    categories: ['cognitive', 'markdown', 'reference', 'structure'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
        }
    };

    const config = getEditorConfig();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Header Area */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        variant="standard"
                        placeholder="Entity Name"
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '1.25rem', fontWeight: 600 }
                        }}
                        sx={{ flexGrow: 1 }}
                    />
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {currentSuggestion ? (
                        <Button
                            variant={currentSuggestion.priority === 'critical' ? 'contained' : 'outlined'}
                            color={currentSuggestion.priority === 'critical' ? 'error' : 'primary'}
                            size="small"
                            startIcon={isGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                            onClick={handleSmartAction}
                            disabled={isGenerating || !isModelReady}
                        >
                            {currentSuggestion.label}
                        </Button>
                    ) : (content === defaultTemplate || !content.trim()) ? (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                            onClick={handleSuggestStructure}
                            disabled={isGenerating || !isModelReady}
                        >
                            Suggest Structure
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isGenerating ? <CircularProgress size={16} /> : <AddLinkIcon />}
                            onClick={handleSuggestConnections}
                            disabled={isGenerating || !isModelReady}
                        >
                            Suggest Connections
                        </Button>
                    )}
                    {/* Auto-link removed as duplicate/confusing */}
                    {githubUser && (
                        <Tooltip title="Publish to Gist">
                            <IconButton
                                size="small"
                                color="default"
                                onClick={handlePublish}
                                disabled={isPublishing || !content}
                            >
                                {isPublishing ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Editor Area - scrollable */}
            {/* Editor Area - full height, internal scroll */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>


                <CognitiveMonacoEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Start writing structured markdown content..."
                    fullHeight
                    rows={30}
                    onSuggestionChange={setCurrentSuggestion}
                />
            </Box>


        </Box >
    );
}
