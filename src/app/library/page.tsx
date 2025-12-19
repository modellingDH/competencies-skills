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
import { useWizard } from '@/components/Studio/Wizard/WizardContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import PublicIcon from '@mui/icons-material/Public';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

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
    competency: <WorkspacePremiumIcon />,
    concept: <LightbulbIcon />,
    skill: <AccountTreeIcon />,
    tool: <BuildIcon />
};

const TYPE_COLORS = {
    competency: 'primary' as const,
    concept: 'secondary' as const,
    skill: 'success' as const,
    tool: 'warning' as const
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

    const allEntities = useMemo(() => {
        const local = EXAMPLE_ENTITIES.map(e => ({ ...e, source: 'local' as const, sourceRepoName: 'Standard Library' }));
        const remote = remoteEntities.map(e => ({ ...e, source: 'remote' as const }));
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

        return results;
    }, [searchQuery, typeFilter, allEntities, fuse]);

    const stats = useMemo(() => {
        return {
            competency: allEntities.filter(e => e.type === 'competency').length,
            concept: allEntities.filter(e => e.type === 'concept').length,
            skill: allEntities.filter(e => e.type === 'skill').length,
            tool: allEntities.filter(e => e.type === 'tool').length,
        };
    }, [allEntities]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LinkIconButton href="/" aria-label="back to home">
                        <ArrowBackIcon />
                    </LinkIconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h3" gutterBottom>
                            Library Explorer
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Browse and explore pre-built competencies, concepts, skills, and tools for AI agents
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={Link}
                        href="/sources"
                        sx={{ mt: 1 }}
                    >
                        Manage Sources
                    </Button>
                </Box>

                {/* Search and Filter */}
                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, description, tags, or source..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <ToggleButtonGroup
                            value={typeFilter}
                            exclusive
                            onChange={(e, newType) => setTypeFilter(newType)}
                            size="small"
                        >
                            <ToggleButton value="competency">
                                <WorkspacePremiumIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Competencies ({stats.competency})
                            </ToggleButton>
                            <ToggleButton value="concept">
                                <LightbulbIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Concepts ({stats.concept})
                            </ToggleButton>
                            <ToggleButton value="skill">
                                <AccountTreeIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Skills ({stats.skill})
                            </ToggleButton>
                            <ToggleButton value="tool">
                                <BuildIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Tools ({stats.tool})
                            </ToggleButton>
                        </ToggleButtonGroup>
                        {typeFilter && (
                            <Button size="small" onClick={() => setTypeFilter(null)}>
                                Clear Filter
                            </Button>
                        )}

                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {project.remoteRepositories.length} Sources Connected
                            </Typography>
                            <IconButton size="small" onClick={() => syncRemoteRepos()} disabled={isSyncing}>
                                <SyncIcon fontSize="small" className={isSyncing ? 'rotating' : ''} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* Results */}
                <Typography variant="h6" gutterBottom>
                    {filteredEntities.length} {filteredEntities.length === 1 ? 'Entity' : 'Entities'}
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
                        return (
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                                        {TYPE_ICONS[entity.type as keyof typeof TYPE_ICONS]}
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                            {entity.sourceRepoName}
                                        </Typography>
                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                            <Chip
                                                label={entity.type}
                                                size="small"
                                                color={TYPE_COLORS[entity.type as keyof typeof TYPE_COLORS]}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography variant="h6" gutterBottom noWrap title={entity.name}>
                                        {entity.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            minHeight: '4.5em',
                                            mb: 1
                                        }}
                                    >
                                        {entity.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {entity.tags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        component={Link}
                                        href={`/library/${entity.type}/${entity.id}${entity.source === 'remote' ? `?source=remote&rawUrl=${encodeURIComponent((entity as any).rawUrl)}&sourceRepoName=${encodeURIComponent((entity as any).sourceRepoName)}` : ''}`}
                                        size="small"
                                        fullWidth
                                        variant="contained"
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        );
                    }}
                />

                {filteredEntities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No entities found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search or filter criteria
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
