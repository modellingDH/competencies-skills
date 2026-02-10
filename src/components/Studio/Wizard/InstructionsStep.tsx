'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import VerifiedIcon from '@mui/icons-material/Verified';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import { useWizard } from './WizardContext';

export function InstructionsStep() {
    const { openWorkspace, workspacePath, toggleSettings } = useWizard();
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            setIsElectron(true);
        }
    }, []);

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Instructions to the Authoring Studio
            </Typography>

            {isElectron && (
                <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FolderOpenIcon color="primary" fontSize="large" />
                        <Typography variant="h6">
                            Desktop Workspace
                        </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                        You are running the desktop version. Open a local folder to save your work directly to disk.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={openWorkspace}
                            startIcon={<FolderOpenIcon />}
                            color="primary"
                        >
                            Open Workspace Folder
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => toggleSettings(true)}
                            startIcon={<SettingsIcon />}
                        >
                            Configure Settings & AI
                        </Button>
                        {workspacePath && (
                            <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1, border: 1, borderColor: 'divider', width: '100%' }}>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                                    <strong>Current:</strong> {workspacePath}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}

            <Typography variant="body1" color="text.secondary" paragraph>
                This tool guides you through creating structured knowledge definitions for AI agents,
                following best practices from cognitive science and prompt engineering.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
                Three-Step Workflow
            </Typography>

            <List>
                <ListItem>
                    <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                        primary="1. Instructions (You are here)"
                        secondary="Learn about the authoring process and workflow"
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CreateIcon color="primary" fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                        primary="2. Authoring Studio"
                        secondary="Create and edit your entities using an intuitive editor with cognitive notations. The studio provides real-time autosave, entity cross-referencing, and contextual guidelines to help you author competencies, concepts, skills, and tools."
                    />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <VerifiedIcon color="primary" fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                        primary="3. Validation & Export"
                        secondary="Validate your work for completeness and consistency. The system checks internal references (@skill:, @concept:, etc.), generates JSON-LD output, and provides instructions for submitting to GitHub."
                    />
                </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
                What You'll Create
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🎯 Competencies
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    High-level agent roles that orchestrate multiple skills to achieve complex objectives.
                    Each competency defines a role, objective, guardrails (safety constraints), and required skills.
                    Example: 'Network Security Analyst' orchestrating skills for threat detection, incident response, and reporting.
                </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    💡 Concepts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Foundational knowledge and terminology that agents need to understand. Concepts can reference
                    external ontologies (Wikidata, ESCO) for semantic alignment and link to related concepts.
                    Example: 'SQL Injection' with definition, threat classification, and mitigation strategies.
                </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🌳 Skills
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Discrete, reusable procedures that define how to accomplish specific tasks. Skills use cognitive
                    workflow notation to specify decision trees, actions, context checks, and failure handling. They
                    reference required tools and include examples. Example: 'Analyze Log File' with step-by-step reasoning.
                </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🔧 Tools
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Atomic capabilities that agents can invoke. Each tool defines input/output parameters,
                    determinism (same input = same output), and side effects. Tools provide the primitive actions
                    that skills compose. Example: 'parse_json' with parameters for validation and error handling.
                </Typography>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
                Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
                Click <strong>Next</strong> to begin authoring, or use the <strong>Import</strong> button
                in the header to load an existing project.
            </Typography>
            <Typography variant="body2" color="text.secondary">
                💡 <strong>Tip:</strong> The authoring studio includes built-in guidance and notation helpers.
                Click the <strong>?</strong> button in the header anytime for context-specific best practices.
            </Typography>
        </Box>
    );
}
