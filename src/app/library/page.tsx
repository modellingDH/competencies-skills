'use client';

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import SearchIcon from '@mui/icons-material/Search';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BuildIcon from '@mui/icons-material/Build';
import { LinkButton, LinkIconButton } from '@/components/LinkComponents';
import Link from 'next/link';
import { VirtuosoGrid } from 'react-virtuoso';
import { styled } from '@mui/material/styles';
import Fuse from 'fuse.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useWizard } from '@/components/Studio/Wizard/WizardContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import PublicIcon from '@mui/icons-material/Public';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import SettingsIcon from '@mui/icons-material/Settings';
import { SYSTEM_ENTITIES } from '@/lib/system-skills';
import { PageInfoTooltip } from '@/components/PageInfoTooltip';

// Example entities metadata (in production, this would come from file system or API)
// Example entities removed. Now fetching from project state.

const TYPE_ICONS = {
    competency: <WorkspacePremiumIcon fontSize="small" />,
    concept: <LightbulbIcon fontSize="small" />,
    skill: <AccountTreeIcon fontSize="small" />,
    tool: <BuildIcon fontSize="small" />,
    'meta-skill': <AutoFixHighIcon fontSize="small" />
};

const TYPE_COLORS = {
    competency: 'primary' as const,
    concept: 'secondary' as const,
    skill: 'success' as const,
    tool: 'warning' as const,
    'meta-skill': 'secondary' as const // Reusing secondary or 'info'
};

const GridContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(3),
    padding: theme.spacing(2, 0),
}));

const CardWrapper = styled('div')(({ theme }) => ({
    height: '100%',
}));

interface Entity {
    id: string;
    name: string;
    type: string;
    tags: string[];
    description: string;
    source: 'local' | 'remote' | 'system';
    sourceRepoName: string;
    content?: string;
}

export default function LibraryPage() {
    const { project, remoteEntities, isSyncing, syncRemoteRepos, deleteEntity, updateProject } = useWizard();

    const toggleSystemSkill = (id: string) => {
        updateProject(prev => ({
            ...prev,
            enabledSystemSkills: {
                ...(prev.enabledSystemSkills || {}),
                [id]: !(prev.enabledSystemSkills?.[id] ?? true)
            }
        }));
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'type' | 'source'>('name');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const allEntities = useMemo<Entity[]>(() => {
        if (!project) return [];

        const localEntities: Entity[] = [];

        const mapToEntity = (collection: Record<string, string> | undefined, singularType: string): Entity[] => {
            if (!collection) return [];
            return Object.entries(collection).map(([id, content]) => {
                const safeContent = typeof content === 'string' ? content : '';
                const nameMatch = safeContent.match(/^name:\s*(.*)$/m);
                const name = nameMatch?.[1] ? nameMatch[1].trim() : id.replace(/_/g, ' ');

                return {
                    id,
                    name,
                    type: singularType,
                    tags: [] as string[],
                    description: 'Local workspace entity',
                    source: 'local' as const,
                    sourceRepoName: 'Local Workspace',
                    content: safeContent
                };
            });
        };

        // Map all types from project
        // Note: Check if project properties exist before accessing if type is loose
        if (project.competencies) localEntities.push(...mapToEntity(project.competencies, 'competency'));
        if (project.skills) localEntities.push(...mapToEntity(project.skills, 'skill'));
        if (project.tools) localEntities.push(...mapToEntity(project.tools, 'tool'));
        if (project.concepts) localEntities.push(...mapToEntity(project.concepts, 'concept'));
        // @ts-ignore - metaSkills naming
        if (project.metaSkills) localEntities.push(...mapToEntity(project.metaSkills, 'meta-skill'));

        // Ensure remote entities match the shape
        const remote = remoteEntities.map(e => ({
            id: e.id,
            name: e.name,
            type: e.type,
            tags: (e.tags || []) as string[], // Ensure tags is string[]
            description: e.description || '', // Ensure description is string
            source: 'remote' as const,
            sourceRepoName: (e as any).sourceRepoName || 'Remote', // Access with 'as any' if not strictly typed
            content: (e as any).content // Access with 'as any' if not strictly typed
        }));

        // System entities
        const systemEntities: Entity[] = SYSTEM_ENTITIES.map(se => {
            const nameMatch = se.content.match(/^name:\s*(.*)$/m);
            const objMatch = se.content.match(/##\s+OBJECTIVE[\s\S]*?\n([^#]+)/);
            const roleMatch = se.content.match(/##\s+ROLE[\s\S]*?\n([^#]+)/);
            const description = objMatch?.[1]
                ? objMatch[1].trim().substring(0, 120).replace(/\n/g, ' ')
                : roleMatch?.[1]
                    ? roleMatch[1].trim().substring(0, 120).replace(/\n/g, ' ')
                    : 'System entity';

            return {
                id: se.id,
                name: se.name,
                type: se.type,
                tags: ['system'] as string[],
                description,
                source: 'system' as const,
                sourceRepoName: 'System',
                content: se.content
            };
        });

        return [...systemEntities, ...localEntities, ...remote];
    }, [project, remoteEntities]);

    const fuse = useMemo(() => new Fuse(allEntities, {
        keys: ['name', 'description', 'tags', 'sourceRepoName'],
        threshold: 0.3,
        distance: 100,
    }), [allEntities]);

    const filteredEntities = useMemo(() => {
        let results = allEntities;

        if (searchQuery) {
            results = fuse.search(searchQuery).map(r => r.item);
        }

        if (typeFilter) {
            results = results.filter(e => e.type === typeFilter);
        }

        // Apply Sorting
        return [...results].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'type') return a.type.localeCompare(b.type);
            if (sortBy === 'source') return a.sourceRepoName.localeCompare(b.sourceRepoName);
            return 0;
        });
    }, [searchQuery, typeFilter, allEntities, fuse, sortBy]);

    const stats = useMemo(() => {
        return {
            competency: allEntities.filter(e => e.type === 'competency').length,
            concept: allEntities.filter(e => e.type === 'concept').length,
            skill: allEntities.filter(e => e.type === 'skill').length,
            tool: allEntities.filter(e => e.type === 'tool').length,
            'meta-skill': allEntities.filter(e => e.type === 'meta-skill').length,
        };
    }, [allEntities]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header & Instructions */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <LinkIconButton href="/" aria-label="back to home" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </LinkIconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Library Explorer
                            </Typography>
                            <PageInfoTooltip
                                title="Library Explorer"
                                description="Browse and manage cognitive entities — structured definitions that power AI agents."
                                tips={[
                                    'Click View Details to see the full markdown of any entity.',
                                    'Copy & paste entity markdown directly into your AI agent\'s system prompt.',
                                    'Use the search bar to filter by name, type, or content.',
                                    'Toggle System Skills to show Gemma\'s built-in knowledge base.',
                                ]}
                            />
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                component={Link}
                                href="/sources"
                                size="small"
                            >
                                Sources
                            </Button>
                        </Box>
                    </Box>

                    {/* How to use banner */}
                    <Alert severity="info" icon={<AutoFixHighIcon fontSize="inherit" />} sx={{ borderRadius: 2, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            How to feed Skills to AI:
                        </Typography>
                        <Box component="ol" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
                            <li><strong>Locate</strong> the needed Skill or Meta-Skill below.</li>
                            <li>Click <strong>View Details</strong> to access the structured markdown content.</li>
                            <li><strong>Copy & Paste</strong> the raw markdown directly into your Agent's System Prompt or Context Window.</li>
                            <li>(Optional) If using a Router, copy the <strong>ID</strong> (e.g., <code>skill/analyze_log</code>) to reference it dynamically.</li>
                        </Box>
                    </Alert>
                </Box>

                {/* Search and Filters - Lean Design */}
                <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                    />

                    <ToggleButtonGroup
                        value={typeFilter}
                        exclusive
                        onChange={(e, newType) => setTypeFilter(newType)}
                        size="small"
                        sx={{ border: 'none' }}
                    >
                        {Object.keys(stats).map((key) => (
                            <ToggleButton key={key} value={key} sx={{ border: 'none', borderRadius: 2, px: 1.5, mx: 0.5, bgcolor: typeFilter === key ? 'action.selected' : 'transparent' }}>
                                {TYPE_ICONS[key as keyof typeof TYPE_ICONS]}
                                <Typography variant="caption" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                    {key.replace('-', ' ')} ({stats[key as keyof typeof stats]})
                                </Typography>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {typeFilter && (
                        <Button size="small" onClick={() => setTypeFilter(null)} color="error" sx={{ textTransform: 'none' }}>
                            Reset
                        </Button>
                    )}
                </Paper>

                {/* Results Count */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 'medium' }}>
                    Showing {filteredEntities.length} entities
                </Typography>

                <VirtuosoGrid
                    style={{ height: '70vh', width: '100%' }}
                    totalCount={filteredEntities.length}
                    overscan={200}
                    components={{
                        List: GridContainer,
                        Item: CardWrapper as any,
                    }}
                    itemContent={(index) => {
                        const entity = filteredEntities[index];
                        if (!entity) return null;
                        const copyText = `@${entity.type}:${entity.id}`;
                        const isCopied = copiedId === entity.id;

                        // Determine colors based on type
                        const typeColor = TYPE_COLORS[entity.type as keyof typeof TYPE_COLORS] || 'primary';

                        return (
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    transition: 'all 0.2s',
                                    bgcolor: entity.type === 'meta-skill' ? 'secondary.50' : 'background.paper',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: `${typeColor}.main`,
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: entity.type === 'meta-skill' ? 'secondary.main' : 'action.hover',
                                                color: entity.type === 'meta-skill' ? 'white' : 'text.primary',
                                                mr: 1.5
                                            }}
                                        >
                                            {TYPE_ICONS[entity.type as keyof typeof TYPE_ICONS]}
                                        </Avatar>
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap title={entity.name}>
                                                {entity.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {entity.id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            minHeight: '2.5em',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {entity.description || "No description provided."}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {entity.source === 'system' && (
                                            <Chip
                                                icon={<SettingsIcon sx={{ fontSize: '0.7rem !important' }} />}
                                                label="System"
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        )}
                                        {entity.tags.filter(t => t !== 'system').slice(0, 3).map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: 'action.hover',
                                                    color: 'text.secondary'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        {entity.source === 'system' ? (
                                            <Tooltip title={project.enabledSystemSkills?.[entity.id] !== false ? 'Loaded in Gemma' : 'Disabled — not loaded in Gemma'}>
                                                <Switch
                                                    size="small"
                                                    checked={project.enabledSystemSkills?.[entity.id] !== false}
                                                    onChange={() => toggleSystemSkill(entity.id)}
                                                    color="success"
                                                />
                                            </Tooltip>
                                        ) : (
                                            <>
                                                <Tooltip title={isCopied ? "Copied ID!" : "Copy Router ID"}>
                                                    <Button
                                                        size="small"
                                                        color="inherit"
                                                        startIcon={isCopied ? <AutoFixHighIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                                        onClick={() => handleCopy(copyText, entity.id)}
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            color: isCopied ? 'success.main' : 'text.secondary',
                                                            minWidth: 0
                                                        }}
                                                    >
                                                        {isCopied ? "Copied" : "Copy ID"}
                                                    </Button>
                                                </Tooltip>
                                                {entity.source === 'local' && (
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                if (confirm(`Delete ${entity.name}?`)) {
                                                                    deleteEntity(entity.type, entity.id);
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    <LinkButton
                                        href={`/library/${entity.type}/${entity.id}${entity.source === 'remote' ? `?source=remote&rawUrl=${encodeURIComponent((entity as any).rawUrl)}&sourceRepoName=${encodeURIComponent((entity as any).sourceRepoName)}` : ''}`}
                                        size="small"
                                        variant="contained"
                                        color={typeColor}
                                        sx={{
                                            boxShadow: 'none',
                                            '&:hover': { boxShadow: 'none' },
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Details
                                    </LinkButton>
                                </CardActions>
                            </Card>
                        );
                    }}
                />

                {filteredEntities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                        <AccountTreeIcon sx={{ fontSize: 48, mb: 1, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                            No library entities found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try searching for something else
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
