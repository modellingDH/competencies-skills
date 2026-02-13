import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAI } from '@/contexts/AIContext';

import { useWizard } from '@/components/Studio/Wizard/WizardContext';

interface CognitiveMarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
    categories?: Array<'cognitive' | 'markdown' | 'reference' | 'structure'>;
    fullHeight?: boolean;
}

export function CognitiveMarkdownEditor({
    value,
    onChange,
    placeholder = '# Start writing...',
    rows = 15,
    categories = ['cognitive', 'markdown', 'reference'],
    fullHeight = false
}: CognitiveMarkdownEditorProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { project, remoteEntities } = useWizard();
    const { generate, isModelReady } = useAI();

    // Autocomplete State
    const { setAiPanelResult, setAiPanelOpen, setAiPanelAction } = useWizard();

    // Autocomplete State
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteOptions, setAutocompleteOptions] = useState<Array<{ type: string, id: string, source?: string }>>([]);
    const [cursorPosition, setCursorPosition] = useState(0);

    // AI Context Menu State
    const [contextMenuPos, setContextMenuPos] = useState<{ top: number, left: number } | null>(null);
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const handleSelect = () => {
        if (inputRef.current) {
            const start = inputRef.current.selectionStart;
            const end = inputRef.current.selectionEnd;
            if (end > start) {
                setSelectionRange({ start, end });
            } else {
                setSelectionRange(null);
                setContextMenuPos(null);
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (inputRef.current) {
            const start = inputRef.current.selectionStart;
            const end = inputRef.current.selectionEnd;
            if (end > start) {
                // Show menu near mouse cursor
                setContextMenuPos({ top: e.clientY, left: e.clientX });
            } else {
                setContextMenuPos(null);
            }
        }
    };

    // Hide menu on typing
    const handleKeyUp = () => {
        // handleSelect is sufficient usually but let's hide menu on key press
        setContextMenuPos(null);
        handleSelect();
    };

    const runAiAction = async (action: 'revise' | 'expand' | 'fix') => {
        if (!selectionRange) return;

        const selectedText = value.substring(selectionRange.start, selectionRange.end);
        setAiLoading(true);
        setContextMenuPos(null); // Hide menu

        try {
            let prompt = "";
            switch (action) {
                case 'revise': prompt = "Revise and improve the clarity of the following text."; break;
                case 'expand': prompt = "Expand on the following text with more details."; break;
                case 'fix': prompt = "Fix grammar and spelling in the following text."; break;
            }

            const userPrompt = `${prompt}\n\nText:\n${selectedText}`;
            const systemPrompt = "You are an expert technical editor. Output ONLY the improved version of the text.";

            const result = await generate(userPrompt, systemPrompt);

            if (result) {
                setAiPanelResult(result);
                setAiPanelOpen(true);
            }
        } catch (e) {
            console.error("AI Action failed", e);
        } finally {
            setAiLoading(false);
        }
    };

    const insertTemplate = (template: string) => {
        if (!inputRef.current) return;

        const start = inputRef.current.selectionStart;
        const end = inputRef.current.selectionEnd;
        const text = value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const insertion = (needsNewline ? '\n' : '') + template;

        const newValue = before + insertion + after;
        onChange(newValue);

        setTimeout(() => {
            inputRef.current?.focus();
            const newPos = start + insertion.length;
            inputRef.current?.setSelectionRange(newPos, newPos);
        }, 10);
    };

    // Detect @ references and show autocomplete
    useEffect(() => {
        const detectReference = () => {
            if (!inputRef.current) return;

            const pos = inputRef.current.selectionStart;
            const textBefore = value.substring(0, pos);
            const lastAtSymbol = textBefore.lastIndexOf('@');

            if (lastAtSymbol === -1 || pos - lastAtSymbol > 50) {
                setShowAutocomplete(false);
                return;
            }

            const potentialRef = textBefore.substring(lastAtSymbol);
            const match = potentialRef.match(/^@(skill|concept|tool|competency):(\w*)$/);

            if (match) {
                const type = match[1];
                const partial = match[2] || '';
                const searchLower = partial.toLowerCase();

                if (!type) {
                    setShowAutocomplete(false);
                    return;
                }

                // Get local options
                const collection = project[`${type}s` as keyof typeof project] as Record<string, string>;
                const localOptions: Array<{ type: string, id: string, source?: string }> = Object.keys(collection || {})
                    .filter(id => id.toLowerCase().includes(searchLower))
                    .map(id => ({ type, id }));

                // Get remote options
                const remoteOptions = (remoteEntities || [])
                    .filter(e => e.type === type && e.id.toLowerCase().includes(searchLower))
                    .map(e => ({ type: e.type, id: e.id, source: 'remote' }));

                const options = [...localOptions, ...remoteOptions];

                if (options.length > 0) {
                    setAutocompleteOptions(options);
                    setShowAutocomplete(true);
                    setCursorPosition(lastAtSymbol);
                } else {
                    setShowAutocomplete(false);
                }
            } else {
                setShowAutocomplete(false);
            }
        };

        detectReference();
    }, [value, project, remoteEntities]);

    const selectAutocomplete = (option: { type: string, id: string }) => {
        if (!inputRef.current) return;

        const pos = inputRef.current.selectionStart;
        const textBefore = value.substring(0, cursorPosition);
        const textAfter = value.substring(pos);

        const newValue = textBefore + `@${option.type}:${option.id}` + textAfter;
        onChange(newValue);
        setShowAutocomplete(false);

        setTimeout(() => {
            inputRef.current?.focus();
            const newPos = textBefore.length + `@${option.type}:${option.id}`.length;
            inputRef.current?.setSelectionRange(newPos, newPos);
        }, 10);
    };

    const styleTools: Array<{ label: string; template: string; icon: React.ReactNode; desc: string; syntax?: string; category: string }> = [];
    const sectionTools: typeof styleTools = [];
    const entityTools: typeof styleTools = [];

    const groups = [
        { label: 'Style', tools: styleTools, color: 'default' as const },
        { label: 'Sections', tools: sectionTools, color: 'primary' as const },
        { label: 'Entities', tools: entityTools, color: 'secondary' as const }
    ].filter(g => g.tools && g.tools.length > 0);

    return (
        <Box sx={{
            border: fullHeight ? 'none' : '1px solid',
            borderColor: 'divider',
            borderRadius: fullHeight ? 0 : 1,
            overflow: 'hidden',
            position: 'relative',
            height: fullHeight ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Toolbar Removed for Lean UX */}

            {/* Editor */}
            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <TextField
                    inputRef={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onSelect={handleSelect}
                    onMouseUp={handleMouseUp}
                    onKeyUp={handleKeyUp}
                    multiline
                    rows={rows}
                    fullWidth
                    variant="standard"
                    placeholder={placeholder}
                    sx={{
                        p: fullHeight ? 0 : 2,
                        bgcolor: 'background.paper',
                        height: fullHeight ? '100%' : 'auto',
                        '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            height: fullHeight ? '100%' : 'auto',
                            alignItems: 'flex-start',
                            p: 0
                        },
                        '& .MuiInputBase-input': {
                            height: fullHeight ? '100% !important' : 'auto',
                            overflow: fullHeight ? 'auto !important' : 'hidden',
                            padding: fullHeight ? '16px !important' : undefined,
                            boxSizing: 'border-box'
                        },
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:after': { borderBottom: 'none' }
                    }}
                />

                {/* Autocomplete Popup */}
                {showAutocomplete && (
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxHeight: 200,
                            width: 300,
                            overflow: 'auto',
                            zIndex: 1000
                        }}
                    >
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', bgcolor: 'action.hover', fontWeight: 'bold' }}>
                            Select reference:
                        </Typography>
                        <List dense>
                            {autocompleteOptions.map((option, idx) => (
                                <ListItemButton
                                    key={idx}
                                    onClick={() => selectAutocomplete(option)}
                                >
                                    <ListItemText
                                        primary={option.id}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="caption">{option.type}</Typography>
                                                {option.source === 'remote' && (
                                                    <Chip label="Remote" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                                                )}
                                            </Box>
                                        }
                                        primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            {/* Context Menu for Selection */}
            {contextMenuPos && isModelReady && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'fixed',
                        top: contextMenuPos.top + 10,
                        left: contextMenuPos.left,
                        zIndex: 1400,
                        p: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 120
                    }}
                >
                    <Typography variant="caption" sx={{ px: 1, py: 0.5, color: 'text.secondary', fontWeight: 'bold' }}>AI Actions</Typography>
                    <ListItemButton dense onClick={() => runAiAction('revise')}>
                        <AutoAwesomeIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                        <ListItemText primary="Revise" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                    </ListItemButton>
                    <ListItemButton dense onClick={() => runAiAction('expand')}>
                        <ListItemText primary="Expand" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                    </ListItemButton>
                    <ListItemButton dense onClick={() => runAiAction('fix')}>
                        <ListItemText primary="Fix Grammar" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                    </ListItemButton>
                </Paper>
            )}

            {/* AI Loading Indicator (Global/Overlay) */}
            {aiLoading && (
                <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'background.paper', p: 1, borderRadius: 1, boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">Generating...</Typography>
                </Box>
            )}
        </Box>
    );
}
