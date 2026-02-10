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
import CircularProgress from '@mui/material/CircularProgress';
import { CognitiveMarkdownEditor } from './CognitiveMarkdownEditor';
import Link from 'next/link';
import { useWizard } from './WizardContext';
import { useAI } from '@/contexts/AIContext';

interface EntityEditorProps {
    type: 'competency' | 'concept' | 'skill' | 'tool';
    id: string;
    onOpenGuidance?: (() => void) | null;
}

function getDefaultTemplate(entityType: string): string {
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
- @skill:example_skill_id`;

        case 'concept':
            return `## Definition
Define this concept clearly and concisely.

## Alignment
**External Reference**: [Wikidata/ESCO](https://example.com)

## Related Concepts
- @concept:related_concept_id`;

        case 'skill':
            return `**Description**: When should the agent use this skill?

# Cognitive Workflow

- @ CONTEXT: Check prerequisites
- > ACTION: Do something using @tool:tool_name
- ? DECISION: Check condition?
    - YES:
        - > ACTION: Continue
    - NO:
        - ! CRITICAL: Stop and escalate

## Required Tools
- @tool:example_tool_id`;

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
    const { project, updateProject, githubUser } = useWizard();
    const { generate, isModelReady } = useAI();

    // Get existing content or initialize with template
    const collection = project[`${type}s` as keyof typeof project] as Record<string, string>;
    const existingContent = (collection[id] || '');

    const [name, setName] = useState(id.replace(/_/g, ' '));
    const [content, setContent] = useState(existingContent || getDefaultTemplate(type));
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleAiGenerate = async () => {
        if (!name) return;
        setIsGenerating(true);
        try {
            const systemPrompt = "You are an expert AI agent architect. You output structured markdown.";
            let userPrompt = "";

            switch (type) {
                case 'competency':
                    userPrompt = `Create a Competency definition for a role named "${name}". Use sections ## ROLE, ## OBJECTIVE, ## GUARDRAILS, ## Required Skills.`;
                    break;
                case 'concept':
                    userPrompt = `Define the technical concept "${name}". Use sections ## Definition, ## Alignment, ## Related Concepts.`;
                    break;
                case 'skill':
                    userPrompt = `Create a Cognitive Skill for "${name}". Use sections ## Description, # Cognitive Workflow (with @ CONTEXT, > ACTION, ? DECISION markers), ## Required Tools.`;
                    break;
                case 'tool':
                    userPrompt = `Describe a tool named "${name}". Use sections ## Description, ## Parameters (Input/Output), ## Side Effects.`;
                    break;
            }

            const result = await generate(userPrompt, systemPrompt);
            if (result) {
                setContent(result);
            }
        } catch (e) {
            console.error("Generation failed:", e);
        } finally {
            setIsGenerating(false);
        }
    };

    // Update content when entity changes
    useEffect(() => {
        const collection = project[`${type}s` as keyof typeof project] as Record<string, string>;
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
        setLastSaved(null); // Reset save status
    }, [type, id, project]);

    // Autosave with debounce
    useEffect(() => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for autosave (2 seconds after last change)
        saveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 2000);

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, content]); // Re-run when name or content changes


    const handlePublish = async () => {
        if (!githubUser || !window.electronAPI) return;

        if (!confirm("About to publish/update this skill on GitHub Gist.\n\nThis action cannot be undone (history is preserved on GitHub).\n\nDo you want to proceed?")) return;

        setIsPublishing(true);
        try {
            // Parse frontmatter for gist_id
            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
            const match = content.match(frontmatterRegex);
            let gistId = null;

            if (match) {
                const idMatch = match[1].match(/^gist_id:\s*(.*)$/m);
                if (idMatch) gistId = idMatch[1].trim();
            }

            let newUrl: string | null = null;
            const description = `Cognitive Library: ${type} - ${name}`;

            if (gistId) {
                newUrl = await window.electronAPI.updateGitHubGist({
                    gistId,
                    name,
                    content,
                    description
                });
            } else {
                newUrl = await window.electronAPI.createGitHubGist({
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
        const markdown = `---
id: ${id}
name: ${name}
---

${content}
`;

        updateProject((prev) => ({
            ...prev,
            [`${type}s`]: {
                ...(prev[`${type}s` as keyof typeof prev] as Record<string, string>),
                [id]: markdown
            }
        }));

        setLastSaved(new Date());
    };

    const getEditorConfig = () => {
        switch (type) {
            case 'competency':
                return {
                    title: 'Edit Competency',
                    hint: 'Use ## ROLE, ## OBJECTIVE, ## GUARDRAILS sections',
                    categories: ['cognitive', 'structure', 'markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'concept':
                return {
                    title: 'Edit Concept',
                    hint: 'Define the concept and link to external ontologies',
                    categories: ['cognitive', 'markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'skill':
                return {
                    title: 'Edit Skill',
                    hint: 'Use cognitive workflow notations (>, ?, @, !)',
                    categories: ['cognitive', 'structure', 'markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            case 'tool':
                return {
                    title: 'Edit Tool',
                    hint: 'Document parameters, determinism, and side effects',
                    categories: ['cognitive', 'markdown', 'reference'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
            default:
                return {
                    title: 'Edit Entity',
                    hint: '',
                    categories: ['cognitive', 'markdown', 'reference', 'structure'] as Array<'cognitive' | 'markdown' | 'reference' | 'structure'>
                };
        }
    };

    const config = getEditorConfig();

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Header Area */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {config.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {githubUser && (
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={isPublishing ? <CircularProgress size={16} /> : <GitHubIcon />}
                                disabled={isPublishing || !content}
                                onClick={handlePublish}
                            >
                                {isPublishing ? 'Publishing...' : 'Publish'}
                            </Button>
                        )}
                        {lastSaved && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Saved {lastSaved.toLocaleTimeString()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        variant="standard"
                        placeholder="Entity Name"
                        fullWidth
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '1.5rem', fontWeight: 600 }
                        }}
                    />
                </Box>

                {/* AI Instructions Banner */}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'secondary.50', borderRadius: 2, border: '1px solid', borderColor: 'secondary.200', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="secondary.main" display="flex" alignItems="center" gap={0.5}>
                            <AutoAwesomeIcon fontSize="inherit" /> AI Generation
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isModelReady
                                ? "Local AI model is ready. Click generate to draft content."
                                : "To use local AI generation, enable the model in the Instructions step."}
                        </Typography>
                    </Box>
                    {isModelReady && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !name}
                            startIcon={isGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                        >
                            {isGenerating ? 'Generating...' : 'Draft Content'}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Editor Area - scrollable */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, pb: 10 }}>
                {config.hint && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        💡 {config.hint}
                    </Typography>
                )}

                <CognitiveMarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Enter cognitive markdown content..."
                    rows={30} // Give plenty of space
                    categories={config.categories}
                />
            </Box>

            {/* Floating Action Button */}
            <Box sx={{ position: 'absolute', bottom: 32, right: 32, zIndex: 10 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    size="large"
                    sx={{
                        borderRadius: 28,
                        height: 56,
                        px: 4,
                        boxShadow: 6,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                    startIcon={<SaveIcon />}
                >
                    Save Changes
                </Button>
            </Box>
        </Box>
    );
}
