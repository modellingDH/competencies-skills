'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MemoryIcon from '@mui/icons-material/Memory';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAI } from '@/contexts/AIContext';

export function LocalModelManager() {
    const {
        isModelReady,
        isModelLoading,
        loadModel,
        unloadModel,
        downloadProgress,
        error
    } = useAI();

    // Only show details when expanded? Or always small?
    // Let's make it a compact card/panel.

    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mb: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="secondary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                        Local AI Config (Gemma 2B)
                    </Typography>
                    {isModelReady && (
                        <Chip label="Ready" color="success" size="small" icon={<MemoryIcon />} />
                    )}
                    {error && (
                        <Chip label="Error" color="error" size="small" />
                    )}
                </Box>
                <Box>
                    {!isModelReady && !isModelLoading && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => loadModel()}
                            color="secondary"
                            disabled={isModelLoading}
                        >
                            Load Model (~1.4GB)
                        </Button>
                    )}
                    {isModelReady && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => unloadModel()}
                            startIcon={<DeleteIcon />}
                        >
                            Unload
                        </Button>
                    )}
                </Box>
            </Box>

            {isModelLoading && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {downloadProgress?.text || "Initializing..."}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {Math.round((downloadProgress?.progress || 0) * 100)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(downloadProgress?.progress || 0) * 100}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>
            )}

            {isModelReady && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Model loaded in browser memory. All inference is local and private.
                </Typography>
            )}

            {error && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}
