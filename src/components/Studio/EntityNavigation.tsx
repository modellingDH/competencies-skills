'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useWizard } from './Wizard/WizardContext';
import Fuse from 'fuse.js';

interface EntityNavigationProps {
    selectedEntity: { type: string; id: string } | null;
    onSelectEntity: (type: string, id: string) => void;
    onCreateEntity: (type: string, name: string) => void;
    onDeleteEntity: (type: string, id: string) => void;
}

export function EntityNavigation({
    selectedEntity,
    onSelectEntity,
    onCreateEntity,
    onDeleteEntity
}: EntityNavigationProps) {
    const { project, remoteEntities } = useWizard();
    const [expandedSection, setExpandedSection] = useState<string | null>('competencies');
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [newEntityName, setNewEntityName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const allIndexableEntities = useMemo(() => {
        const projectEntities = [
            ...Object.keys(project.competencies).map(id => ({ id, type: 'competency', source: 'project', sourceRepoName: 'Local Project' })),
            ...Object.keys(project.concepts).map(id => ({ id, type: 'concept', source: 'project', sourceRepoName: 'Local Project' })),
            ...Object.keys(project.skills).map(id => ({ id, type: 'skill', source: 'project', sourceRepoName: 'Local Project' })),
            ...Object.keys(project.tools).map(id => ({ id, type: 'tool', source: 'project', sourceRepoName: 'Local Project' })),
            ...Object.keys(project.metaSkills || {}).map(id => ({ id, type: 'meta-skill', source: 'project', sourceRepoName: 'Local Project' })),
        ];

        const remote = remoteEntities.map(e => ({ ...e, source: 'remote' }));

        return [...projectEntities, ...remote];
    }, [project, remoteEntities]);

    const fuse = useMemo(() => new Fuse(allIndexableEntities, {
        keys: ['id', 'name', 'type', 'description', 'sourceRepoName'],
        threshold: 0.3
    }), [allIndexableEntities]);

    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return fuse.search(searchQuery).map(r => r.item);
    }, [searchQuery, fuse]);

    const sections = [
        {
            key: 'competencies',
            singular: 'competency',
            label: 'Competencies',
            icon: <WorkIcon />,
            items: Object.keys(project.competencies),
            color: 'primary' as const
        },
        {
            key: 'concepts',
            singular: 'concept',
            label: 'Concepts',
            icon: <LightbulbIcon />,
            items: Object.keys(project.concepts),
            color: 'secondary' as const
        },
        {
            key: 'skills',
            singular: 'skill',
            label: 'Skills',
            icon: <AccountTreeIcon />,
            items: Object.keys(project.skills),
            color: 'success' as const
        },
        {
            key: 'tools',
            singular: 'tool',
            label: 'Tools',
            icon: <BuildIcon />,
            items: Object.keys(project.tools),
            color: 'info' as const
        },
        {
            key: 'metaSkills',
            singular: 'meta-skill',
            label: 'Meta Skills',
            icon: <AutoFixHighIcon />,
            items: Object.keys(project.metaSkills || {}),
            color: 'secondary' as const
        }
    ];

    const handleStartAdd = (sectionKey: string) => {
        setAddingTo(sectionKey);
        setNewEntityName('');
        setExpandedSection(sectionKey);
    };

    const handleConfirmAdd = (sectionKey: string) => {
        if (newEntityName.trim()) {
            onCreateEntity(sectionKey, newEntityName.trim());
            setAddingTo(null);
            setNewEntityName('');
        }
    };

    const handleCancelAdd = () => {
        setAddingTo(null);
        setNewEntityName('');
    };

    const handleDragStart = (type: string, id: string) => (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', `@${type}:${id}`);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                borderRight: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                    Studio Toolbox
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search all entities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                        endAdornment: searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery('')}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )
                    }}
                />
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {searchQuery ? (
                    <List sx={{ p: 0 }}>
                        {searchResults.length === 0 ? (
                            <ListItem>
                                <Typography variant="body2" color="text.secondary">
                                    No matches found
                                </Typography>
                            </ListItem>
                        ) : (
                            searchResults.map((entity: any) => (
                                <ListItem
                                    key={`${entity.source}-${entity.type}-${entity.id}`}
                                    disablePadding
                                    divider
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            if (entity.source === 'project') {
                                                onSelectEntity(entity.type, entity.id);
                                            } else {
                                                navigator.clipboard.writeText(`@${entity.type}:${entity.id}`);
                                            }
                                        }}
                                        sx={{ py: 1.5 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            {entity.source === 'remote' ? <PublicIcon fontSize="small" color="info" /> : <AutoFixHighIcon fontSize="small" color="primary" />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={entity.id}
                                            secondary={`${entity.type} • ${entity.sourceRepoName}`}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold', fontFamily: 'monospace' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <IconButton
                                            size="small"
                                            title="Copy Reference"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(`@${entity.type}:${entity.id}`);
                                            }}
                                        >
                                            <ContentPasteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemButton>
                                </ListItem>
                            ))
                        )}
                    </List>
                ) : (
                    <>
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
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartAdd(section.key);
                                        }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </ListItemButton>

                                {expandedSection === section.key && (
                                    <List dense sx={{ pl: 1, bgcolor: 'action.hover' }}>
                                        {addingTo === section.key && (
                                            <ListItem sx={{ gap: 0.5 }}>
                                                <TextField
                                                    size="small"
                                                    placeholder={`New ${section.singular} name`}
                                                    value={newEntityName}
                                                    onChange={(e) => setNewEntityName(e.target.value)}
                                                    onKeyPress={(e: any) => {
                                                        if (e.key === 'Enter') handleConfirmAdd(section.key);
                                                        if (e.key === 'Escape') handleCancelAdd();
                                                    }}
                                                    autoFocus
                                                    fullWidth
                                                    sx={{ mr: 0.5 }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleConfirmAdd(section.key)}
                                                >
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={handleCancelAdd}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </ListItem>
                                        )}

                                        {section.items.length === 0 && addingTo !== section.key ? (
                                            <ListItem>
                                                <Typography variant="caption" component="div">
                                                    No items yet,{' '}
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{
                                                            color: 'primary.main',
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline',
                                                            '&:hover': { color: 'primary.dark' }
                                                        }}
                                                        onClick={() => handleStartAdd(section.key)}
                                                    >
                                                        + add a first
                                                    </Typography>
                                                </Typography>
                                            </ListItem>
                                        ) : (
                                            <>
                                                {section.items.map((id) => (
                                                    <ListItem
                                                        key={id}
                                                        draggable
                                                        onDragStart={handleDragStart(section.singular, id)}
                                                        sx={{
                                                            cursor: 'grab',
                                                            bgcolor: selectedEntity?.type === section.singular && selectedEntity?.id === id
                                                                ? 'action.selected'
                                                                : 'transparent',
                                                            '&:active': { cursor: 'grabbing' },
                                                            '&:hover': { bgcolor: 'action.selected' }
                                                        }}
                                                        secondaryAction={
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteEntity(section.singular, id);
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        }
                                                        onClick={() => onSelectEntity(section.singular, id)}
                                                    >
                                                        <Chip
                                                            label={id}
                                                            size="small"
                                                            color={section.color}
                                                            variant={selectedEntity?.type === section.singular && selectedEntity?.id === id ? 'filled' : 'outlined'}
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
                                                ))}

                                                {section.items.length > 0 && addingTo !== section.key && (
                                                    <ListItem>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'primary.main',
                                                                cursor: 'pointer',
                                                                textDecoration: 'underline',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                '&:hover': { color: 'primary.dark' }
                                                            }}
                                                            onClick={() => handleStartAdd(section.key)}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                            add
                                                        </Typography>
                                                    </ListItem>
                                                )}
                                            </>
                                        )}
                                    </List>
                                )}
                                <Divider />
                            </Box>
                        ))}
                    </>
                )}
            </Box>
        </Paper>
    );
}

