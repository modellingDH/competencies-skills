'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useWizard } from '@/components/Studio/Wizard/WizardContext';
import { LinkIconButton } from '@/components/LinkComponents';
import { RemoteRepositoryService } from '@/lib/remote-repo-service';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

export default function SourcesPage() {
    const { project, updateProject, toggleRemoteRepo, removeRemoteRepo } = useWizard();
    const [newRepoUrl, setNewRepoUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const remoteService = new RemoteRepositoryService();

    const handleAddRepo = async () => {
        if (!newRepoUrl) return;
        setIsAdding(true);
        setError('');

        try {
            // Validate repo and fetch registry name
            const entities = await remoteService.fetchRegistry(newRepoUrl);
            if (!entities || entities.length === 0) {
                throw new Error('Could not find a valid registry.json in this repository.');
            }

            const firstEntity = entities[0];
            if (!firstEntity) {
                throw new Error('Registry contains no valid entities.');
            }

            const repoName = firstEntity.sourceRepoName;

            updateProject(prev => ({
                ...prev,
                remoteRepositories: [
                    ...prev.remoteRepositories,
                    { url: newRepoUrl, name: repoName, enabled: true }
                ]
            }));
            setNewRepoUrl('');
        } catch (err: any) {
            setError(err.message || 'Failed to add repository.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIconButton href="/" aria-label="back to home">
                        <ArrowBackIcon />
                    </LinkIconButton>
                    <Typography variant="h4">Manage Library Sources</Typography>
                </Box>

                <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
                    <Typography variant="h6" gutterBottom>Add New Source</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Connect a GitHub repository containing a <code>registry.json</code> file to import its entities.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="https://github.com/user/repo"
                            value={newRepoUrl}
                            onChange={(e) => setNewRepoUrl(e.target.value)}
                            disabled={isAdding}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            startIcon={isAdding ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                            onClick={handleAddRepo}
                            disabled={isAdding || !newRepoUrl}
                        >
                            Add
                        </Button>
                    </Box>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Paper>

                <Typography variant="h6" gutterBottom>Active Sources</Typography>
                <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    {project.remoteRepositories.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No remote sources added yet.</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {project.remoteRepositories.map((repo, idx) => (
                                <Box key={repo.url}>
                                    <ListItem sx={{ py: 2 }}>
                                        <Box sx={{ mr: 2, color: 'primary.main', display: 'flex' }}>
                                            <GitHubIcon />
                                        </Box>
                                        <ListItemText
                                            primary={repo.name}
                                            secondary={repo.url}
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                        <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                                                <Typography variant="caption" color={repo.enabled ? 'primary' : 'text.disabled'}>
                                                    {repo.enabled ? 'Enabled' : 'Disabled'}
                                                </Typography>
                                                <Switch
                                                    edge="end"
                                                    onChange={() => toggleRemoteRepo(repo.url)}
                                                    checked={repo.enabled}
                                                />
                                            </Box>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => removeRemoteRepo(repo.url)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {idx < project.remoteRepositories.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
                                </Box>
                            ))}
                        </List>
                    )}
                </Paper>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant="outlined" component="a" href="/library">Go to Library</Button>
                    <Button variant="contained" component="a" href="/studio">Authoring Studio</Button>
                </Box>
            </Container>
        </Box>
    );
}
