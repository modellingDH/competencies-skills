import { Box, Button, Typography, IconButton, Container, Card, CardContent, CardActions, Avatar, Tooltip, Alert, Grid } from '@mui/material';
import { useStudio } from '@/contexts/StudioContext';
import { LinkButton, LinkIconButton } from '@/components/LinkComponents';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { SettingsDialog } from '@/components/Studio/Settings/SettingsDialog';
import { useState } from 'react';

export function Dashboard() {
    const { project, openCompetency, createCompetency, deleteCompetency } = useStudio();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Convert competencies object to array
    const competencies = Object.entries((project?.competencies || {}) as Record<string, string>).map(([id, content]) => {
        // Parse name from content (naive)
        const safeContent = typeof content === 'string' ? content : '';
        const nameMatch = safeContent.match(/^name:\s*(.*)$/m);
        const name = (nameMatch && nameMatch[1]) ? nameMatch[1].trim() : id.replace(/_/g, ' ');
        return { id, name, content: safeContent };
    });

    const handleCreate = () => {
        const id = `new_competency_${Date.now()}`;
        const template = `---
name: New Competency
id: ${id}
---

## ROLE
Define the role here.

## OBJECTIVE
Define the objective.
`;
        createCompetency(id, template);
        openCompetency(id);
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
                                Studio Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Your personal workspace for creating and managing competencies.
                            </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                            <LinkButton href="/library" startIcon={<LibraryBooksIcon />} variant="outlined" color="primary">
                                Library
                            </LinkButton>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                New Competency
                            </Button>
                            <Tooltip title="Settings">
                                <IconButton onClick={() => setIsSettingsOpen(true)}>
                                    <SettingsIcon color="action" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* How to use banner */}
                    <Alert severity="info" icon={<AutoFixHighIcon fontSize="inherit" />} sx={{ borderRadius: 2, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            How to build a Competency:
                        </Typography>
                        <Box component="ol" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
                            <li>Click <strong>New Competency</strong> to start a draft.</li>
                            <li>Use the <strong>Editor</strong> to define the Role, Objective, and interactions.</li>
                            <li><strong>Copy</strong> the ID to reference it in your agent configuration.</li>
                        </Box>
                    </Alert>
                </Box>

                <Grid container spacing={3}>
                    {competencies.map((comp) => (
                        // @ts-ignore - Grid props issue
                        <Grid item xs={12} sm={6} md={4} key={comp.id}>
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
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: 'primary.main',
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
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                mr: 1.5
                                            }}
                                        >
                                            <WorkspacePremiumIcon fontSize="small" />
                                        </Avatar>
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap title={comp.name}>
                                                {comp.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {comp.id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{
                                        mb: 2,
                                        minHeight: '2.5em',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Naive description extraction could go here, for now placeholder */}
                                        Custom competency definition.
                                    </Typography>

                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                    <Box>
                                        <Tooltip title="Share (Coming Soon)">
                                            <IconButton size="small">
                                                <ShareIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this competency?')) {
                                                        deleteCompetency(comp.id);
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={() => openCompetency(comp.id)}
                                        sx={{ borderRadius: 2, boxShadow: 'none' }}
                                    >
                                        Edit
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}

                    {competencies.length === 0 && (
                        // @ts-ignore
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                                <WorkspacePremiumIcon sx={{ fontSize: 48, mb: 1, color: 'text.disabled' }} />
                                <Typography variant="h6" color="text.secondary">
                                    No competencies found
                                </Typography>
                                <Button sx={{ mt: 2 }} variant="text" startIcon={<AddIcon />} onClick={handleCreate}>
                                    Create your first Competency
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
            <SettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </Box>
    );
}
