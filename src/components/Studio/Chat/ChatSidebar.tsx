import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Stack, CircularProgress, Button, Chip, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CompressIcon from '@mui/icons-material/Compress';
import CodeIcon from '@mui/icons-material/Code';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useAI } from '@/contexts/AIContext';
import { useStudio } from '@/contexts/StudioContext';

// --- Quick Command Definitions ---

interface QuickCommand {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    buildPrompt: (content: string, entityId: string) => { user: string; system: string };
}

const QUICK_COMMANDS: QuickCommand[] = [
    {
        id: 'expand',
        label: '/expand',
        icon: <UnfoldMoreIcon fontSize="small" />,
        description: 'Add more detail to current content',
        buildPrompt: (content, entityId) => ({
            system: 'You are an expert technical writer. Output ONLY the expanded markdown content, no explanations.',
            user: `Expand the following entity definition "${entityId}" with more detailed steps, examples, and decision points.
Keep the existing structure (frontmatter, ## ROLE, ## OBJECTIVE) intact.
Add depth to each section — provide specific actions, edge cases, and professional guidance.

Content:
${content}`
        })
    },
    {
        id: 'simplify',
        label: '/simplify',
        icon: <CompressIcon fontSize="small" />,
        description: 'Simplify language for readability',
        buildPrompt: (content, entityId) => ({
            system: 'You are a plain-language editor. Output ONLY the simplified markdown, no explanations.',
            user: `Simplify the following entity "${entityId}" for readability.
Use shorter sentences, simpler vocabulary, and clearer structure.
Keep all sections and frontmatter intact. Remove jargon where possible.

Content:
${content}`
        })
    },
    {
        id: 'examples',
        label: '/examples',
        icon: <CodeIcon fontSize="small" />,
        description: 'Generate usage examples',
        buildPrompt: (content, entityId) => ({
            system: 'You are a technical documentation writer. Output ONLY markdown.',
            user: `Generate 2-3 practical usage examples for the entity "${entityId}".
Show how an AI agent would use this skill/tool/concept in real scenarios.
Format each example as:
## Example: [Scenario Name]
**Input**: [description]
**Agent Action**: [step-by-step what the agent does]
**Output**: [expected result]

Entity Content:
${content}`
        })
    },
    {
        id: 'export',
        label: '/export',
        icon: <IosShareIcon fontSize="small" />,
        description: 'Format as agent system prompt',
        buildPrompt: (content, entityId) => ({
            system: 'You are a prompt engineer. Output ONLY the system prompt text, ready to paste.',
            user: `Convert the following entity "${entityId}" into a clean system prompt that can be pasted directly into an AI agent (GPT, Claude, Gemini, etc).

Rules:
- Start with "You are..." based on the ## ROLE section
- Include the objective clearly
- Convert any steps into clear instructions
- Resolve any internal links [Name](/library/...) into inline descriptions
- Remove frontmatter and markdown structure — output plain text instructions

Entity Content:
${content}`
        })
    }
];

// --- Component ---

interface ChatSidebarProps {
    suggestedAction?: {
        label: string;
        description: string;
        apply?: () => Promise<string | void>;
    } | null;
    onApplyAction?: (action: any) => void;
}

export function ChatSidebar({ suggestedAction, onApplyAction }: ChatSidebarProps) {
    const { generate, isModelReady } = useAI();
    const { getLibraryContext, activeEntity, project } = useStudio();
    const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Get active document content
    const getActiveDoc = useCallback(() => {
        if (!activeEntity) return '';
        return (project.competencies?.[activeEntity.id]) ||
            (project.skills?.[activeEntity.id]) ||
            (project.tools?.[activeEntity.id]) ||
            (project.concepts?.[activeEntity.id]) ||
            (project.metaSkills?.[activeEntity.id]) || '';
    }, [activeEntity, project]);

    // Execute a quick command
    const executeCommand = useCallback(async (cmd: QuickCommand) => {
        const content = getActiveDoc();
        if (!content) {
            setMessages(prev => [...prev,
            { role: 'user', content: cmd.label },
            { role: 'model', content: 'No active document open. Please open an entity in the editor first.' }
            ]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: `${cmd.label} — ${cmd.description}` }]);
        setIsLoading(true);

        try {
            const { user, system } = cmd.buildPrompt(content, activeEntity?.id || 'unknown');
            const response = await generate(user, system);
            if (response) {
                setMessages(prev => [...prev, { role: 'model', content: response }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', content: 'Error running command.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [generate, getActiveDoc, activeEntity]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');

        // Check for slash commands
        const cmdMatch = userMsg.match(/^\/(\w+)\s*(.*)?$/);
        if (cmdMatch && cmdMatch[1]) {
            const cmdId = cmdMatch[1].toLowerCase();
            const cmd = QUICK_COMMANDS.find(c => c.id === cmdId);
            if (cmd) {
                executeCommand(cmd);
                return;
            }
        }

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const libCtx = getLibraryContext();
            const activeDoc = getActiveDoc();

            const systemPrompt = `You are a Studio Assistant.
Help the user write and refine skills, tools, and concepts.
Use the following Library Context (available skills/meta-skills) to inform your answers.
If the user asks to validate or review, look for relevant "Validation" meta-skills in the library.

Reference Library:
${libCtx}

Active Document (${activeEntity?.id || 'None'}):
${activeDoc}`;

            const response = await generate(userMsg, systemPrompt);
            if (response) {
                setMessages(prev => [...prev, { role: 'model', content: response }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', content: "Error generating response." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Active Suggestion Card */}
                {suggestedAction && (
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            bgcolor: 'secondary.soft',
                            border: '1px solid',
                            borderColor: 'secondary.main',
                            borderRadius: 2,
                            animation: 'fadeIn 0.5s'
                        }}
                    >
                        <Stack direction="row" alignItems="center" gap={1} mb={1}>
                            <AutoFixHighIcon fontSize="small" color="secondary" />
                            <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark">
                                Suggestion: {suggestedAction.label}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" paragraph>
                            {suggestedAction.description}
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            fullWidth
                            onClick={() => onApplyAction && onApplyAction(suggestedAction)}
                        >
                            Review & Apply
                        </Button>
                    </Paper>
                )}

                {messages.length === 0 && !suggestedAction && (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <AutoAwesomeIcon color="action" sx={{ fontSize: 40 }} />
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 220 }}>
                            Ask me anything, or use quick commands to work with the active document.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', px: 1 }}>
                            {QUICK_COMMANDS.map(cmd => (
                                <Typography
                                    key={cmd.id}
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'flex', gap: 1 }}
                                >
                                    <code style={{ fontWeight: 'bold', minWidth: 70 }}>{cmd.label}</code>
                                    {cmd.description}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}
                {messages.map((msg, idx) => (
                    <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                            p: 1.5,
                            maxWidth: '90%',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                            color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                    </Paper>
                ))}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={20} />
                    </Box>
                )}
                <div ref={bottomRef} />
            </Box>

            {/* Quick Action Buttons */}
            <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {QUICK_COMMANDS.map(cmd => (
                    <Tooltip key={cmd.id} title={cmd.description} placement="top">
                        <Chip
                            icon={cmd.icon as React.ReactElement}
                            label={cmd.label}
                            size="small"
                            variant="outlined"
                            onClick={() => executeCommand(cmd)}
                            disabled={!isModelReady || isLoading}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                                transition: 'all 0.2s'
                            }}
                        />
                    </Tooltip>
                ))}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Ask Gemma or type /command..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={!isModelReady || isLoading}
                        multiline
                        maxRows={4}
                    />
                    <IconButton color="primary" onClick={handleSend} disabled={!isModelReady || isLoading || !input.trim()}>
                        <SendIcon />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
}
