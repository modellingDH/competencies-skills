'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import { useWizard } from './Wizard/WizardContext';

interface EntitySidebarProps {
    onEntityDragStart: (type: string, id: string) => void;
}

export function EntitySidebar({ onEntityDragStart }: EntitySidebarProps) {
    const { project } = useWizard();
    const [expandedSection, setExpandedSection] = useState<string | null>('competencies');

    const sections = [
        {
            key: 'competencies',
            label: 'Competencies',
            icon: <WorkIcon />,
            items: Object.keys(project.competencies),
            color: 'primary' as const
        },
        {
            key: 'concepts',
            label: 'Concepts',
            icon: <LightbulbIcon />,
            items: Object.keys(project.concepts),
            color: 'secondary' as const
        },
        {
            key: 'skills',
            label: 'Skills',
            icon: <AccountTreeIcon />,
            items: Object.keys(project.skills),
            color: 'success' as const
        },
        {
            key: 'tools',
            label: 'Tools',
            icon: <BuildIcon />,
            items: Object.keys(project.tools),
            color: 'info' as const
        }
    ];

    const handleDragStart = (type: string, id: string) => (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', `@${type}:${id}`);
        e.dataTransfer.effectAllowed = 'copy';
        onEntityDragStart(type, id);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                borderRight: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                overflow: 'auto'
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                    Defined Entities
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Drag to reference in editor
                </Typography>
            </Box>

            {sections.map((section) => (
                <Box key={section.key}>
                    <ListItemButton
                        onClick={() => setExpandedSection(
                            expandedSection === section.key ? null : section.key
                        )}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {section.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={section.label}
                            secondary={`${section.items.length} items`}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItemButton>

                    {expandedSection === section.key && (
                        <List dense sx={{ pl: 2, bgcolor: 'action.hover' }}>
                            {section.items.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        secondary="No items defined yet"
                                        secondaryTypographyProps={{ variant: 'caption', fontStyle: 'italic' }}
                                    />
                                </ListItem>
                            ) : (
                                section.items.map((id) => (
                                    <ListItem
                                        key={id}
                                        draggable
                                        onDragStart={handleDragStart(section.key.slice(0, -1), id)}
                                        sx={{
                                            cursor: 'grab',
                                            '&:active': { cursor: 'grabbing' },
                                            '&:hover': { bgcolor: 'action.selected' }
                                        }}
                                    >
                                        <Chip
                                            label={id}
                                            size="small"
                                            color={section.color}
                                            variant="outlined"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                maxWidth: '100%',
                                                '& .MuiChip-label': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    )}
                    <Divider />
                </Box>
            ))}
        </Paper>
    );
}
