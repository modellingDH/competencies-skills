import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpIcon from '@mui/icons-material/Help';
import RadarIcon from '@mui/icons-material/Radar';
import WarningIcon from '@mui/icons-material/Warning';
import TitleIcon from '@mui/icons-material/Title';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import { useWizard } from './WizardContext';

interface Tool {
    label: string;
    prefix?: string;
    template: string;
    icon: React.ReactNode;
    desc: string;
}

const COGNITIVE_NODES: Tool[] = [
    {
        label: 'Action',
        template: '- > ACTION: [Do something] using [tool_name]',
        icon: <PlayArrowIcon fontSize="small" />,
        desc: "Instruct the agent to perform an operation"
    },
    {
        label: 'Decision',
        template: '- ? DECISION: [Question?]\n    - YES:\n        - ...\n    - NO:\n        - ...',
        icon: <HelpIcon fontSize="small" />,
        desc: "Ask a question to branch logic"
    },
    {
        label: 'Context',
        template: '- @ CONTEXT: [Check environment state]',
        icon: <RadarIcon fontSize="small" />,
        desc: "Check the environment before acting"
    },
    {
        label: 'Critical',
        template: '- ! CRITICAL: [Safety Check]',
        icon: <WarningIcon fontSize="small" />,
        desc: "Safety constraint or immediate stop"
    }
];

const MD_FORMATTING: Tool[] = [
    { label: 'H1', template: '# Heading 1', icon: <TitleIcon fontSize="small" />, desc: 'Insert heading level 1' },
    { label: 'H2', template: '## Heading 2', icon: <TitleIcon fontSize="small" />, desc: 'Insert heading level 2' },
    { label: 'H3', template: '### Heading 3', icon: <TitleIcon fontSize="small" />, desc: 'Insert heading level 3' },
    { label: 'Bold', template: '**bold text**', icon: <FormatBoldIcon fontSize="small" />, desc: 'Make text bold' },
    { label: 'Italic', template: '*italic text*', icon: <FormatItalicIcon fontSize="small" />, desc: 'Make text italic' },
    { label: 'List', template: '- List item', icon: <FormatListBulletedIcon fontSize="small" />, desc: 'Insert bulleted list' },
    { label: 'Link', template: '[link text](url)', icon: <LinkIcon fontSize="small" />, desc: 'Insert hyperlink' }
];

interface CognitiveWorkflowEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export function CognitiveWorkflowEditor({ value, onChange }: CognitiveWorkflowEditorProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { project } = useWizard();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
            inputRef.current?.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 10);
    };

    const insertReference = (type: 'competency' | 'concept' | 'skill' | 'tool', id: string) => {
        insertTemplate(`@ref:${type}:${id}`);
        setAnchorEl(null);
    };

    const handleOpenRefMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseRefMenu = () => {
        setAnchorEl(null);
    };

    // Count available references
    const hasReferences =
        Object.keys(project.competencies).length > 0 ||
        Object.keys(project.concepts).length > 0 ||
        Object.keys(project.skills).length > 0 ||
        Object.keys(project.tools).length > 0;

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ p: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* Cognitive Nodes */}
                <ButtonGroup variant="outlined" size="small">
                    {COGNITIVE_NODES.map((tool) => (
                        <Tooltip key={tool.label} title={tool.desc} arrow>
                            <Button
                                onClick={() => insertTemplate(tool.template)}
                                startIcon={tool.icon}
                            >
                                {tool.label}
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>

                <Divider orientation="vertical" flexItem />

                {/* Markdown Formatting */}
                <ButtonGroup variant="outlined" size="small">
                    {MD_FORMATTING.map((tool) => (
                        <Tooltip key={tool.label} title={tool.desc} arrow>
                            <Button
                                onClick={() => insertTemplate(tool.template)}
                                startIcon={tool.icon}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                {tool.label}
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>

                <Divider orientation="vertical" flexItem />

                {/* Reference Inserter */}
                <Tooltip title={hasReferences ? "Insert reference to defined entity" : "No entities defined yet"}>
                    <span>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleOpenRefMenu}
                            disabled={!hasReferences}
                            startIcon={<LinkIcon />}
                        >
                            Insert Ref
                        </Button>
                    </span>
                </Tooltip>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseRefMenu}
                >
                    {Object.keys(project.competencies).length > 0 && (
                        <Box>
                            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                Competencies
                            </MenuItem>
                            {Object.keys(project.competencies).map(id => (
                                <MenuItem key={id} onClick={() => insertReference('competency', id)}>
                                    {id}
                                </MenuItem>
                            ))}
                            <Divider />
                        </Box>
                    )}
                    {Object.keys(project.concepts).length > 0 && (
                        <Box>
                            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                Concepts
                            </MenuItem>
                            {Object.keys(project.concepts).map(id => (
                                <MenuItem key={id} onClick={() => insertReference('concept', id)}>
                                    {id}
                                </MenuItem>
                            ))}
                            <Divider />
                        </Box>
                    )}
                    {Object.keys(project.skills).length > 0 && (
                        <Box>
                            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                Skills
                            </MenuItem>
                            {Object.keys(project.skills).map(id => (
                                <MenuItem key={id} onClick={() => insertReference('skill', id)}>
                                    {id}
                                </MenuItem>
                            ))}
                            <Divider />
                        </Box>
                    )}
                    {Object.keys(project.tools).length > 0 && (
                        <Box>
                            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                Tools
                            </MenuItem>
                            {Object.keys(project.tools).map(id => (
                                <MenuItem key={id} onClick={() => insertReference('tool', id)}>
                                    {id}
                                </MenuItem>
                            ))}
                        </Box>
                    )}
                </Menu>
            </Box>

            {/* Editor */}
            <TextField
                inputRef={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                multiline
                rows={15}
                fullWidth
                variant="standard"
                placeholder="# Cognitive Workflow&#10;- @ CONTEXT: Check system status..."
                sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: '0.9rem' },
                    '& .MuiInput-underline:before': { borderBottom: 'none' },
                    '& .MuiInput-underline:after': { borderBottom: 'none' }
                }}
            />
        </Box>
    );
}
