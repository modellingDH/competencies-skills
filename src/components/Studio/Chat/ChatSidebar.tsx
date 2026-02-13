import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Stack, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useAI } from '@/contexts/AIContext';
import { useStudio } from '@/contexts/StudioContext';

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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // RAG Context
            const libCtx = getLibraryContext();

            // Try to find content in any collection
            let activeDoc = '';
            if (activeEntity) {
                activeDoc = (project.competencies?.[activeEntity.id]) ||
                    (project.skills?.[activeEntity.id]) ||
                    (project.tools?.[activeEntity.id]) ||
                    (project.concepts?.[activeEntity.id]) ||
                    (project.metaSkills?.[activeEntity.id]) || '';
            }

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
                            bgcolor: 'secondary.soft', // fallback to default if soft undefined
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
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 200 }}>
                            Ask me anything about your skills or how to improve the current document.
                        </Typography>
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

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Ask Gemma..."
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
