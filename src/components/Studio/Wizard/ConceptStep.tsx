'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GuidancePanel } from '../Guidance/GuidancePanel';
import { useWizard } from './WizardContext';
import { generateId } from '@/utils/id-generator';
import { WIZARD_GUIDANCE } from './guidance-config';

export function ConceptStep() {
    const { project, updateProject } = useWizard();
    const [conceptName, setConceptName] = useState('');
    const [conceptId, setConceptId] = useState('');
    const [conceptDescription, setConceptDescription] = useState('');
    const [alignmentName, setAlignmentName] = useState('');
    const [alignmentUrl, setAlignmentUrl] = useState('');
    const [alignments, setAlignments] = useState<Array<{ name: string, url: string }>>([]);
    const [relatedConcepts, setRelatedConcepts] = useState<string[]>([]);
    const [currentRelated, setCurrentRelated] = useState('');
    const [useAutoId, setUseAutoId] = useState(true);

    const conceptIds = Object.keys(project.concepts);

    const handleNameChange = (name: string) => {
        setConceptName(name);
        if (useAutoId && name) {
            setConceptId(generateId(name));
        }
    };

    const handleAddAlignment = () => {
        if (alignmentName && alignmentUrl) {
            setAlignments([...alignments, { name: alignmentName, url: alignmentUrl }]);
            setAlignmentName('');
            setAlignmentUrl('');
        }
    };

    const handleRemoveAlignment = (index: number) => {
        setAlignments(alignments.filter((_, i) => i !== index));
    };

    const handleAddRelated = () => {
        if (currentRelated && !relatedConcepts.includes(currentRelated)) {
            setRelatedConcepts([...relatedConcepts, currentRelated]);
            setCurrentRelated('');
        }
    };

    const handleRemoveRelated = (concept: string) => {
        setRelatedConcepts(relatedConcepts.filter(c => c !== concept));
    };

    const handleAddConcept = () => {
        const finalId = conceptId || generateId(conceptName);

        if (!finalId || !conceptName || !conceptDescription) {
            alert('Please provide a Name and Description for the concept');
            return;
        }

        const alignmentBlock = alignments.length > 0
            ? `alignment:\n${alignments.map(a => `  - name: ${a.name}\n    url: ${a.url}`).join('\n')}`
            : '';

        const relatedBlock = relatedConcepts.length > 0
            ? `related_to:\n${relatedConcepts.map(c => `  - ${c}`).join('\n')}`
            : '';

        const markdownContent = `---
id: ${finalId}
name: ${conceptName}
description: ${conceptDescription}
${alignmentBlock}
${relatedBlock}
---`;

        updateProject((prev) => ({
            ...prev,
            concepts: {
                ...prev.concepts,
                [finalId]: markdownContent
            }
        }));

        // Reset form
        setConceptId('');
        setConceptName('');
        setConceptDescription('');
        setAlignments([]);
        setRelatedConcepts([]);
        setUseAutoId(true);
    };

    const handleDeleteConcept = (id: string) => {
        updateProject((prev) => {
            const newConcepts = { ...prev.concepts };
            delete newConcepts[id];
            return { ...prev, concepts: newConcepts };
        });
    };

    const guidance = WIZARD_GUIDANCE.concept;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                    Define Concepts
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Concepts are shared vocabulary definitions that ensure semantic consistency across your project.
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <TextField
                        label="Concept Name"
                        value={conceptName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="Network Latency"
                        required
                    />
                    <TextField
                        label="Concept ID (auto-generated)"
                        value={conceptId}
                        onChange={(e) => {
                            setConceptId(e.target.value);
                            setUseAutoId(false);
                        }}
                        fullWidth
                        margin="normal"
                        placeholder="network_latency_c8d1"
                        helperText="Auto-generated from name. Edit to customize."
                        disabled={useAutoId && !conceptName}
                    />
                    <TextField
                        label="Description"
                        value={conceptDescription}
                        onChange={(e) => setConceptDescription(e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                        placeholder="The time it takes for data to travel from source to destination."
                        required
                    />

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                        External Alignments (Optional)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="Name (e.g., Wikidata)"
                            value={alignmentName}
                            onChange={(e) => setAlignmentName(e.target.value)}
                            size="small"
                        />
                        <TextField
                            label="URL"
                            value={alignmentUrl}
                            onChange={(e) => setAlignmentUrl(e.target.value)}
                            size="small"
                            fullWidth
                        />
                        <Button
                            variant="outlined"
                            onClick={handleAddAlignment}
                            disabled={!alignmentName || !alignmentUrl}
                        >
                            Add
                        </Button>
                    </Box>
                    <List dense>
                        {alignments.map((alignment, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    <IconButton edge="end" size="small" onClick={() => handleRemoveAlignment(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={alignment.name}
                                    secondary={alignment.url}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                        Related Concepts (Optional)
                    </Typography>
                    {conceptIds.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                select
                                label="Select Concept"
                                value={currentRelated}
                                onChange={(e) => setCurrentRelated(e.target.value)}
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                            >
                                <option value="">-- Select a concept --</option>
                                {conceptIds.filter(id => id !== conceptId).map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </TextField>
                            <Button
                                variant="outlined"
                                onClick={handleAddRelated}
                                disabled={!currentRelated}
                            >
                                Add
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No other concepts defined yet.
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {relatedConcepts.map(concept => (
                            <Chip
                                key={concept}
                                label={concept}
                                onDelete={() => handleRemoveRelated(concept)}
                                color="secondary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddConcept}
                        sx={{ mt: 2 }}
                    >
                        Add Concept
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Defined Concepts ({conceptIds.length})
                </Typography>
                <List>
                    {conceptIds.map((id) => (
                        <ListItem
                            key={id}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteConcept(id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={id} secondary="Concept" />
                        </ListItem>
                    ))}
                </List>
            </Grid>

            <Grid item xs={12} md={4}>
                <GuidancePanel
                    title={guidance.title}
                    description={guidance.description}
                    items={guidance.items}
                />
            </Grid>
        </Grid>
    );
}
