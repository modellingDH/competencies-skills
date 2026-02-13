import { useState, useMemo } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, ListItemIcon, Tabs, Tab, Button, Divider, IconButton, Tooltip, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStudio } from '@/contexts/StudioContext';
import { EntityCreationModal } from './EntityCreationModal';

// Icons for entity types
const TYPE_ICONS = {
    skill: <AccountTreeIcon fontSize="small" />,
    tool: <BuildIcon fontSize="small" />,
    concept: <LightbulbIcon fontSize="small" />
};

export function LibrarySidebar() {
    const { project } = useStudio();
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCopy = (id: string, type: string) => {
        const ref = `@${type}:${id}`;
        navigator.clipboard.writeText(ref);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleDragStart = (e: React.DragEvent, id: string, type: string) => {
        const ref = `@${type}:${id}`;
        e.dataTransfer.setData('text/plain', ref);
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Filter entities based on active tab and search
    const filteredEntities = useMemo(() => {
        const type = activeTab === 0 ? 'skills' : activeTab === 1 ? 'tools' : 'concepts';
        const collection = (project[type] || {}) as Record<string, string>;

        return Object.entries(collection)
            .map(([id, content]) => {
                const nameMatch = content.match(/^name:\s*(.*)$/m);
                const name = (nameMatch && nameMatch[1]) ? nameMatch[1].trim() : id;
                return { id, name, content, type: type.slice(0, -1) }; // remove 's'
            })
            .filter(entity =>
                entity.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entity.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [project, activeTab, searchQuery]);

    return (
        <Box sx={{ width: 300, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">Entity Library</Typography>
                <Typography variant="caption" color="text.secondary">Drag or copy ID to insert</Typography>
            </Box>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 40 }}
            >
                <Tab label="Skills" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
                <Tab label="Tools" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
                <Tab label="Concepts" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
            </Tabs>

            {/* Search */}
            <Box sx={{ p: 1.5 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                        sx: { fontSize: '0.875rem' }
                    }}
                />
            </Box>

            {/* List */}
            <List sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
                {filteredEntities.map((entity) => (
                    <ListItem
                        key={entity.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, entity.id, entity.type)}
                        sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                            pr: 9 // space for copy button
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            {TYPE_ICONS[entity.type as keyof typeof TYPE_ICONS]}
                        </ListItemIcon>
                        <ListItemText
                            primary={entity.name}
                            secondary={entity.id}
                            primaryTypographyProps={{ variant: 'body2', noWrap: true, fontWeight: 'medium' }}
                            secondaryTypographyProps={{ variant: 'caption', noWrap: true, sx: { fontFamily: 'monospace' } }}
                        />

                        {/* Actions overlay */}
                        <Box sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}>
                            <Tooltip title={copiedId === entity.id ? "Copied!" : "Copy ID"}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopy(entity.id, entity.type)}
                                    color={copiedId === entity.id ? "success" : "default"}
                                >
                                    <ContentCopyIcon fontSize="small" sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </ListItem>
                ))}

                {filteredEntities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="caption">No entities found.</Typography>
                    </Box>
                )}
            </List>

            {/* Footer / Quick Add */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsModalOpen(true)}
                >
                    New {activeTab === 0 ? 'Skill' : activeTab === 1 ? 'Tool' : 'Concept'}
                </Button>
            </Box>

            <EntityCreationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={activeTab === 0 ? 'skill' : activeTab === 1 ? 'tool' : 'concept'}
            />
        </Box>
    );
}
