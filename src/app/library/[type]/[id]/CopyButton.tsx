'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';

export function CopyButton({ uri, content, id }: { uri: string; content: string; id: string }) {
    const [snackbar, setSnackbar] = useState('');

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        setSnackbar(message);
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Box>
            <Snackbar
                open={Boolean(snackbar)}
                autoHideDuration={2000}
                onClose={() => setSnackbar('')}
                message={snackbar}
            />
        </>
    );
}
