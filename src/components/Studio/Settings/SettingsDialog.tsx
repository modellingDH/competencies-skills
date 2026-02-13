'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import GitHubIcon from '@mui/icons-material/GitHub';
import VerifiedIcon from '@mui/icons-material/Verified';
import SettingsIcon from '@mui/icons-material/Settings';

import { ProjectManager } from '@/services/project_manager';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useWizard } from '@/components/Studio/Wizard/WizardContext';
import { LocalModelManager } from '../LocalModelManager';

interface SettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, index, value, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
            style={{ padding: '20px 0' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
    const {
        project,
        updateProject,
        setProject,
        driveUser,
        githubUser,
        refreshAuthStatus,
        settingsTab,
        toggleSettings
    } = useWizard();
    const [newRepoUrl, setNewRepoUrl] = useState('');
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            setIsElectron(true);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        toggleSettings(true, newValue);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                ProjectManager.loadProject(file).then(setProject);
            }
        };
        input.click();
    };

    const handleExport = () => {
        ProjectManager.exportProject(project);
    };

    const handleAddRepo = () => {
        if (!newRepoUrl) return;
        updateProject(prev => ({
            ...prev,
            remoteRepositories: [
                ...prev.remoteRepositories,
                {
                    url: newRepoUrl,
                    name: `Custom Repo (${newRepoUrl.split('/').pop()})`,
                    enabled: true
                }
            ]
        }));
        setNewRepoUrl('');
    };

    const handleToggleRepo = (url: string) => {
        updateProject(prev => ({
            ...prev,
            remoteRepositories: prev.remoteRepositories.map(r =>
                r.url === url ? { ...r, enabled: !r.enabled } : r
            )
        }));
    };

    const handleRemoveRepo = (url: string) => {
        updateProject(prev => ({
            ...prev,
            remoteRepositories: prev.remoteRepositories.filter(r => r.url !== url)
        }));
    };

    // Auth Handlers
    const handleDriveConnect = async () => {
        if (window.electronAPI?.authenticateGoogleDrive) {
            await window.electronAPI.authenticateGoogleDrive();
            await refreshAuthStatus();
        }
    };

    const handleDriveLogout = async () => {
        if (window.electronAPI?.logoutGoogleDrive) {
            await window.electronAPI.logoutGoogleDrive();
            await refreshAuthStatus();
        }
    };

    const handleGitHubConnect = async () => {
        if (window.electronAPI?.authenticateGitHub) {
            await window.electronAPI.authenticateGitHub();
            await refreshAuthStatus();
        }
    };

    const handleGitHubLogout = async () => {
        if (window.electronAPI?.logoutGitHub) {
            await window.electronAPI.logoutGitHub();
            await refreshAuthStatus();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Settings & Configuration
            </DialogTitle>
            <DialogContent dividers>
                <Tabs value={settingsTab} onChange={handleTabChange} aria-label="settings tabs">
                    <Tab label="General & Repositories" />
                    <Tab label="Integrations" />
                    <Tab label="AI Model" />
                    <Tab label="Project Management" />
                </Tabs>

                {/* General Tab: Repositories & Local Folder */}
                <TabPanel value={settingsTab} index={0}>
                    <Typography variant="h6" gutterBottom>Local Storage</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 4, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Project Directory"
                            value={'~/Code/competencies-skills'} // Hardcoded for now as project.path might not exist on type
                            disabled
                        />
                        <Button variant="outlined" startIcon={<FolderOpenIcon />}>
                            Change
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" gutterBottom>Community Registries</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Manage the Git repositories used as sources for importing Cognitive Skills, Concepts, and Tools.
                        The "Official Registry" is the main project default. You can add your own organization's or personal repository here.
                    </Typography>

                    <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                        {project.remoteRepositories.map((repo) => (
                            <ListItem key={repo.url}>
                                <ListItemText
                                    primary={repo.name}
                                    secondary={repo.url}
                                    primaryTypographyProps={{ fontWeight: 'bold' }}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={repo.enabled}
                                        onChange={() => handleToggleRepo(repo.url)}
                                        sx={{ mr: 1 }}
                                    />
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveRepo(repo.url)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="https://github.com/username/repo"
                            value={newRepoUrl}
                            onChange={(e) => setNewRepoUrl(e.target.value)}
                            label="Add Custom Repository URL"
                        />
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddRepo}
                            disabled={!newRepoUrl}
                        >
                            Add
                        </Button>
                    </Box>
                </TabPanel>

                {/* Integrations Tab */}
                <TabPanel value={settingsTab} index={1}>
                    <Typography variant="h6" gutterBottom>Cloud Integrations</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Connect external services to enable cloud storage features and community sharing.
                    </Typography>

                    {/* Google Drive */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'success.main', bgcolor: 'success.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CloudQueueIcon color="success" fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">Google Drive</Typography>
                                    <Typography variant="caption" display="block">
                                        Enables saving and syncing your cognitive library to your personal Drive (Path: /Cognitive Library). Skills are automatically mirrored to the 'meta-skills' folder.
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                {driveUser ? (
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Chip
                                            icon={<VerifiedIcon />}
                                            label={driveUser}
                                            color="success"
                                            size="small"
                                            sx={{ mb: 1, display: 'flex' }}
                                        />
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<CloudOffIcon />}
                                            onClick={handleDriveLogout}
                                        >
                                            Disconnect
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CloudQueueIcon />}
                                        onClick={handleDriveConnect}
                                        disabled={!isElectron}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>

                    {/* GitHub */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'secondary.main', bgcolor: 'secondary.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <GitHubIcon color="secondary" fontSize="large" />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">GitHub</Typography>
                                    <Typography variant="caption" display="block">
                                        Enables sharing your skills as public Gists and contributing to the community.
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                {githubUser ? (
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Chip
                                            icon={<VerifiedIcon />}
                                            label={githubUser}
                                            color="secondary"
                                            size="small"
                                            sx={{ mb: 1, display: 'flex' }}
                                        />
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<CloudOffIcon />}
                                            onClick={handleGitHubLogout}
                                        >
                                            Disconnect
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<GitHubIcon />}
                                        onClick={handleGitHubConnect}
                                        disabled={!isElectron}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </TabPanel>

                {/* AI Model Tab */}
                <TabPanel value={settingsTab} index={2}>
                    <Typography variant="h6" gutterBottom>Local AI Configuration</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Manage the local LLM (Large Language Model) used for diverse reasoning tasks and auto-completion.
                        The model runs entirely in your browser using WebLLM, ensuring privacy.
                    </Typography>
                    <LocalModelManager />
                </TabPanel>

                {/* Project Management Tab */}
                <TabPanel value={settingsTab} index={3}>
                    <Typography variant="h6" gutterBottom>Project Management</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Import or export your entire project (skills, competencies, etc.) as a JSON file.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileUploadIcon />}
                            onClick={handleImport}
                        >
                            Import Project
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExport}
                        >
                            Export Project
                        </Button>
                    </Box>
                </TabPanel>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
