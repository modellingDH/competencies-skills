'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { useWizard } from '@/components/Studio/Wizard/WizardContext';

interface CopyButtonProps {
    uri: string;
    content: string;
    id: string;
    type: 'competency' | 'concept' | 'skill' | 'tool';
    rawUrl: string | undefined;
    sourceRepoName: string | undefined;
    sourceRepoUrl: string | undefined;
}

export function CopyButton({ uri, content, id, type, rawUrl, sourceRepoName, sourceRepoUrl }: CopyButtonProps) {
    const [snackbar, setSnackbar] = useState('');
    const [isCloning, setIsCloning] = useState(false);
    const { cloneRemoteEntity } = useWizard();

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        setSnackbar(message);
    };

    const handleClone = async () => {
        setIsCloning(true);
        // If it's a local example being viewed, we'll treat it as a remote entity with a mock repo URL
        // but for now, the primary use case is remote entities which HAVE a rawUrl.
        const success = await cloneRemoteEntity({
            id,
            name: id.replace(/_/g, ' '),
            type,
            description: '', // Desc will be in content
            tags: [],
            repositoryUrl: sourceRepoUrl || '',
            rawUrl: rawUrl || '',
            sourceRepoName: sourceRepoName || 'Remote',
            sourceRepoUrl: sourceRepoUrl || ''
        });

        if (success) {
            setSnackbar('Entity cloned to project!');
        } else {
            setSnackbar('Failed to clone entity.');
        }
        setIsCloning(false);
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyToClipboard(uri, 'URI copied!')}
                    size="small"
                >
                    Copy URI
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyToClipboard(content, 'Markdown copied!')}
                    size="small"
                >
                    Copy Markdown
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                        const blob = new Blob([content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${id}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    size="small"
                >
                    Download
                </Button>

                {rawUrl && (
                    <Button
                        variant="contained"
                        startIcon={isCloning ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                        onClick={handleClone}
                        disabled={isCloning}
                        size="small"
                        color="secondary"
                    >
                        Clone to Project
                    </Button>
                )}
            </Box>
            <Snackbar
                open={Boolean(snackbar)}
                autoHideDuration={3000}
                onClose={() => setSnackbar('')}
                message={snackbar}
            />
        </>
    );
}
