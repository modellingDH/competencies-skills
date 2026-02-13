
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface SuggestionDialogProps {
    open: boolean;
    title: string;
    content: string;
    onClose: () => void;
    onApply: (content: string) => void;
}

export function SuggestionDialog({ open, title, content, onClose, onApply }: SuggestionDialogProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        // Optionally show toast
    };

    // Calculate diff or show raw?
    // For MVP, show raw content. 
    // Maybe clean up `:::ai-suggestion` markers for display if user wants "clean copy"?
    // But applying needs markers for editor?
    // Wait, the `structure.apply` returns the FULL content with markers.
    // So pasting it into editor is safe.
    // If the user wants to copy just the *fix*, they might be confused by the full doc.
    // But standard practice: "Here is the new document".

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box component="div" sx={{ typography: 'h6', flexGrow: 1 }}>{title}</Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: 'action.hover', p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Review the suggested changes below. You can copy the code manually or apply it directly to the document.
                </Typography>
                <Box
                    component="pre"
                    sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'auto',
                        maxHeight: '50vh',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {content}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                    color="inherit"
                >
                    Copy to Clipboard
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onApply(content)}
                >
                    Apply Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
