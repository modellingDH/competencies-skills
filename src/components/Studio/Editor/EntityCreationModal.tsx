import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select, MenuItem,
    Box, Typography
} from '@mui/material';
import { useStudio } from '@/contexts/StudioContext';

interface EntityCreationModalProps {
    open: boolean;
    onClose: () => void;
    initialType?: 'skill' | 'tool' | 'concept';
}

export function EntityCreationModal({ open, onClose, initialType = 'skill' }: EntityCreationModalProps) {
    const { createEntity } = useStudio();
    const [type, setType] = useState<'skill' | 'tool' | 'concept'>(initialType);
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [description, setDescription] = useState('');
    const [manualId, setManualId] = useState(false);

    // Auto-generate ID from name
    const handleNameChange = (val: string) => {
        setName(val);
        if (!manualId) {
            setId(val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
        }
    };

    const handleCreate = () => {
        if (!id || !name) return;

        const template = `---
name: ${name}
id: ${id}
type: ${type}
description: ${description}
---

${description}
`;
        createEntity(type, id, template);
        onClose();
        // Reset form
        setName('');
        setId('');
        setDescription('');
        setManualId(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Entity</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={type}
                            label="Type"
                            onChange={(e) => setType(e.target.value as any)}
                        >
                            <MenuItem value="skill">Skill</MenuItem>
                            <MenuItem value="tool">Tool</MenuItem>
                            <MenuItem value="concept">Concept</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g., Analyze Log File"
                    />

                    <TextField
                        label="ID"
                        value={id}
                        onChange={(e) => {
                            setId(e.target.value);
                            setManualId(true);
                        }}
                        fullWidth
                        size="small"
                        helperText="Unique identifier (snake_case)"
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Briefly describe what this entity does..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleCreate} disabled={!name || !id}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
