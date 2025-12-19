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
import { COGNITIVE_MD_NOTATION, type NotationTool } from '@/lib/cognitive-md-notation';
import { useWizard } from '@/components/Studio/Wizard/WizardContext';

interface CognitiveMarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
    categories?: Array<'cognitive' | 'markdown' | 'reference' | 'structure'>;
}

export function CognitiveMarkdownEditor({
    value,
    onChange,
    placeholder = '# Start writing...',
    rows = 15,
    categories = ['cognitive', 'markdown', 'reference']
}: CognitiveMarkdownEditorProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { project, remoteEntities } = useWizard();
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteOptions, setAutocompleteOptions] = useState<Array<{ type: string, id: string, source?: string }>>([]);
    const [cursorPosition, setCursorPosition] = useState(0);

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

    // Organize tools by the three groups
    const styleTools = categories.includes('markdown') ? COGNITIVE_MD_NOTATION.markdown : [];
    const sectionTools = [
        ...(categories.includes('cognitive') ? (COGNITIVE_MD_NOTATION.cognitive || []) : []),
        ...(categories.includes('structure') ? (COGNITIVE_MD_NOTATION.structure || []) : [])
    ];
    const entityTools = categories.includes('reference') ? COGNITIVE_MD_NOTATION.reference : [];

    const groups = [
        { label: 'Style', tools: styleTools, color: 'default' as const },
        { label: 'Sections', tools: sectionTools, color: 'primary' as const },
        { label: 'Entities', tools: entityTools, color: 'secondary' as const }
    ].filter(g => g.tools && g.tools.length > 0);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
            {/* Toolbar */}
            <Box sx={{
                p: 1.5,
                bgcolor: 'grey.50',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}>
                {groups.map((group) => (
                    <Box key={group.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip
                                label={group.label}
                                size="small"
                                color={group.color}
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(group.tools as NotationTool[]).map((tool) => (
                                <Tooltip key={tool.label} title={`${tool.desc} (${tool.syntax})`} arrow>
                                    <Button
                                        onClick={() => insertTemplate(tool.template)}
                                        startIcon={tool.icon}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 'auto',
                                            px: 1.5,
                                            py: 0.5,
                                            fontSize: '0.75rem',
                                            textTransform: 'none',
                                            borderColor: 'divider',
                                            color: 'text.primary',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'primary.50'
                                            }
                                        }}
                                    >
                                        {tool.label}
                                    </Button>
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Editor */}
            <Box sx={{ position: 'relative' }}>
                <TextField
                    inputRef={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    multiline
                    rows={rows}
                    fullWidth
                    variant="standard"
                    placeholder={placeholder}
                    sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.9rem' },
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
        </Box>
    );
}
