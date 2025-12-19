import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpIcon from '@mui/icons-material/Help';
import RadarIcon from '@mui/icons-material/Radar';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TitleIcon from '@mui/icons-material/Title';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export interface NotationTool {
    category: 'cognitive' | 'markdown' | 'reference' | 'structure';
    label: string;
    template: string;
    icon: React.ReactNode;
    desc: string;
    syntax?: string;
}

export const COGNITIVE_MD_NOTATION: Record<string, NotationTool[]> = {
    // Cognitive Workflow Nodes
    cognitive: [
        {
            category: 'cognitive',
            label: 'Action',
            template: '- > ACTION: [Do something] using [tool_name]',
            icon: <PlayArrowIcon fontSize="small" />,
            desc: "Instruct the agent to perform an operation",
            syntax: '> ACTION: description'
        },
        {
            category: 'cognitive',
            label: 'Decision',
            template: '- ? DECISION: [Question?]\n    - YES:\n        - ...\n    - NO:\n        - ...',
            icon: <HelpIcon fontSize="small" />,
            desc: "Ask a question to branch logic",
            syntax: '? DECISION: question?'
        },
        {
            category: 'cognitive',
            label: 'Context',
            template: '- @ CONTEXT: [Check environment state]',
            icon: <RadarIcon fontSize="small" />,
            desc: "Check the environment before acting",
            syntax: '@ CONTEXT: description'
        },
        {
            category: 'cognitive',
            label: 'Critical',
            template: '- ! CRITICAL: [Safety Check]',
            icon: <WarningIcon fontSize="small" />,
            desc: "Safety constraint or immediate stop",
            syntax: '! CRITICAL: constraint'
        }
    ],

    // Standard Markdown
    markdown: [
        {
            category: 'markdown',
            label: 'H1',
            template: '# Heading 1',
            icon: <TitleIcon fontSize="small" />,
            desc: 'Main heading',
            syntax: '# text'
        },
        {
            category: 'markdown',
            label: 'H2',
            template: '## Heading 2',
            icon: <TitleIcon fontSize="small" />,
            desc: 'Subheading',
            syntax: '## text'
        },
        {
            category: 'markdown',
            label: 'H3',
            template: '### Heading 3',
            icon: <TitleIcon fontSize="small" />,
            desc: 'Sub-subheading',
            syntax: '### text'
        },
        {
            category: 'markdown',
            label: 'Bold',
            template: '**bold text**',
            icon: <FormatBoldIcon fontSize="small" />,
            desc: 'Bold text',
            syntax: '**text**'
        },
        {
            category: 'markdown',
            label: 'Italic',
            template: '*italic text*',
            icon: <FormatItalicIcon fontSize="small" />,
            desc: 'Italic text',
            syntax: '*text*'
        },
        {
            category: 'markdown',
            label: 'List',
            template: '- List item',
            icon: <FormatListBulletedIcon fontSize="small" />,
            desc: 'Bulleted list',
            syntax: '- item'
        },
        {
            category: 'markdown',
            label: 'Code',
            template: '`code`',
            icon: <CodeIcon fontSize="small" />,
            desc: 'Inline code',
            syntax: '`code`'
        },
        {
            category: 'markdown',
            label: 'Link',
            template: '[link text](url)',
            icon: <LinkIcon fontSize="small" />,
            desc: 'Hyperlink',
            syntax: '[text](url)'
        }
    ],

    // Entity References
    reference: [
        {
            category: 'reference',
            label: '@skill',
            template: '@skill:',
            icon: <AccountTreeIcon fontSize="small" />,
            desc: 'Reference a skill',
            syntax: '@skill:id'
        },
        {
            category: 'reference',
            label: '@concept',
            template: '@concept:',
            icon: <LightbulbIcon fontSize="small" />,
            desc: 'Reference a concept',
            syntax: '@concept:id'
        },
        {
            category: 'reference',
            label: '@tool',
            template: '@tool:',
            icon: <BuildIcon fontSize="small" />,
            desc: 'Reference a tool',
            syntax: '@tool:id'
        }
    ],

    // Structural Elements (for Competencies)
    structure: [
        {
            category: 'structure',
            label: 'Role',
            template: '## ROLE\nDefine the agent\'s role here...',
            icon: <TitleIcon fontSize="small" />,
            desc: 'Define the agent role',
            syntax: '## ROLE'
        },
        {
            category: 'structure',
            label: 'Objective',
            template: '## OBJECTIVE\nDefine what this competency aims to achieve...',
            icon: <TitleIcon fontSize="small" />,
            desc: 'Define the objective',
            syntax: '## OBJECTIVE'
        },
        {
            category: 'structure',
            label: 'Guardrails',
            template: '## GUARDRAILS\n- Never do X\n- Always verify Y\n- Escalate if Z',
            icon: <WarningIcon fontSize="small" />,
            desc: 'Define safety constraints',
            syntax: '## GUARDRAILS'
        }
    ]
};

// Helper to get all tools flattened
export function getAllNotationTools(): NotationTool[] {
    return Object.values(COGNITIVE_MD_NOTATION).flat();
}

// Helper to get tools by category
export function getToolsByCategory(category: NotationTool['category']): NotationTool[] {
    return COGNITIVE_MD_NOTATION[category] || [];
}
