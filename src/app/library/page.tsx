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

// Example entities metadata (in production, this would come from file system or API)
const EXAMPLE_ENTITIES = [
    { id: 'network_security_analyst', name: 'Network Security Analyst', type: 'competency', tags: ['security', 'networking'], description: 'Protect networks from cyber threats and coordinate incident response' },
    { id: 'data_pipeline_engineer', name: 'Data Pipeline Engineer', type: 'competency', tags: ['data-engineering', 'etl'], description: 'Build and maintain automated data workflows' },
    { id: 'sql_injection', name: 'SQL Injection', type: 'concept', tags: ['security', 'vulnerability'], description: 'Code injection technique exploiting database vulnerabilities' },
    { id: 'oauth2', name: 'OAuth 2.0', type: 'concept', tags: ['authentication', 'security'], description: 'Authorization framework for delegated access' },
    { id: 'api_rate_limiting', name: 'API Rate Limiting', type: 'concept', tags: ['api', 'performance'], description: 'Control request frequency to protect services' },
    { id: 'analyze_log_file', name: 'Analyze Log File', type: 'skill', tags: ['debugging', 'monitoring'], description: 'Extract insights and identify patterns in log files' },
    { id: 'validate_json_schema', name: 'Validate JSON Schema', type: 'skill', tags: ['data-validation', 'api'], description: 'Verify JSON data conforms to defined schemas' },
    { id: 'parse_api_response', name: 'Parse API Response', type: 'skill', tags: ['api', 'integration'], description: 'Extract and transform data from API responses' },
    { id: 'parse_json', name: 'Parse JSON', type: 'tool', tags: ['data', 'parsing'], description: 'Parse JSON strings with comprehensive error handling' },
    { id: 'regex_match', name: 'Regex Match', type: 'tool', tags: ['text', 'pattern-matching'], description: 'Perform regular expression matching on text' },
    { id: 'http_request', name: 'HTTP Request', type: 'tool', tags: ['network', 'api'], description: 'Make HTTP requests with retry logic and error handling' },
];

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

export default function LibraryPage() {
    const { project, remoteEntities, isSyncing, syncRemoteRepos } = useWizard();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'type' | 'source'>('name');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const allEntities = useMemo(() => {
        const local = EXAMPLE_ENTITIES.map(e => ({ ...e, source: 'local' as const, sourceRepoName: 'Standard Library' }));
        const remote = remoteEntities.map(e => ({ ...e, source: 'remote' as const }));

        // Also include project entities if they are not in EXAMPLE_ENTITIES (basic merge logic)
        // For now, let's just stick to the example + remote logic as existing, but assume 'project' entities might be mixed in via `remoteEntities` or need separate handling if we want to show *current workspace* stuff.
        // Given the prompt "Standard Library", let's keep it clean.

        return [...local, ...remote];
    }, [remoteEntities]);

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
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header & Instructions */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <LinkIconButton href="/" aria-label="back to home" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </LinkIconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Library Explorer
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                A curated registry of cognitive behaviors.
                            </Typography>
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
                            <li>Click <strong>View Details</strong> to access the raw Cognitive Markdown.</li>
                            <li><strong>Copy & Paste</strong> the raw markdown directly into your Agent's System Prompt or Context Window.</li>
                            <li>(Optional) If using a Router, copy the <strong>ID</strong> (e.g., <code>@skill:analyze_log</code>) to reference it dynamically.</li>
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
                                        {entity.tags.slice(0, 3).map((tag) => (
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
