'use client';

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CognitiveMarkdownEditor } from './CognitiveMarkdownEditor';
import { useWizard } from './WizardContext';

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
    const { project, updateProject } = useWizard();

    // Get existing content or initialize with template
    const existingContent = (project[`${type}s` as keyof typeof project][id] as string || '');

    const [name, setName] = useState(id.replace(/_/g, ' '));
    const [content, setContent] = useState(existingContent || getDefaultTemplate(type));
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update content when entity changes
    useEffect(() => {
        const newContent = (project[`${type}s` as keyof typeof project][id] as string || '');
        setContent(newContent || getDefaultTemplate(type));
        setName(id.replace(/_/g, ' '));
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
                ...prev[`${type}s` as keyof typeof prev],
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
        <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {config.title}: {id}
            </Typography>

            <TextField
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
                required
            />

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Content
            </Typography>
            {config.hint && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    💡 {config.hint}
                    {onOpenGuidance && (
                        <>
                            ,{' '}
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    '&:hover': { color: 'primary.dark' }
                                }}
                                onClick={onOpenGuidance}
                            >
                                see guidelines
                            </Typography>
                        </>
                    )}
                </Typography>
            )}
            <CognitiveMarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Edit content here..."
                rows={20}
                categories={config.categories}
            />

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    size="large"
                >
                    Save Now
                </Button>

                {lastSaved && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                            Last saved: {lastSaved.toLocaleTimeString()}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
