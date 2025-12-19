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
import { CognitiveMarkdownEditor } from './CognitiveMarkdownEditor';
import { useWizard } from './WizardContext';
import { generateId } from '@/utils/id-generator';
import { WIZARD_GUIDANCE } from './guidance-config';

export function CompetencyStep() {
    const { project, updateProject } = useWizard();
    const [competencyName, setCompetencyName] = useState('');
    const [competencyId, setCompetencyId] = useState('');
    const [competencyDescription, setCompetencyDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [useAutoId, setUseAutoId] = useState(true);

    const competencyIds = Object.keys(project.competencies);
    const availableSkills = Object.keys(project.skills);

    const handleNameChange = (name: string) => {
        setCompetencyName(name);
        if (useAutoId && name) {
            setCompetencyId(generateId(name));
        }
    };

    const handleAddSkill = () => {
        if (currentSkill && !requiredSkills.includes(currentSkill)) {
            setRequiredSkills([...requiredSkills, currentSkill]);
            setCurrentSkill('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setRequiredSkills(requiredSkills.filter(s => s !== skill));
    };

    const handleAddCompetency = () => {
        const finalId = competencyId || generateId(competencyName);

        if (!finalId || !competencyName) {
            alert('Please provide a Name for the competency');
            return;
        }

        const skillsList = requiredSkills.map(s => `  - ${s}`).join('\n');

        const markdownContent = `---
id: ${finalId}
name: ${competencyName}
description: ${competencyDescription}
required_skills:
${skillsList}
---

# ORCHESTRATION LOGIC
Define how skills are combined and sequenced here.
`;

        updateProject((prev) => ({
            ...prev,
            competencies: {
                ...prev.competencies,
                [finalId]: markdownContent
            }
        }));

        // Reset form
        setCompetencyId('');
        setCompetencyName('');
        setCompetencyDescription('');
        setRequiredSkills([]);
        setUseAutoId(true);
    };

    const handleDeleteCompetency = (id: string) => {
        updateProject((prev) => {
            const newCompetencies = { ...prev.competencies };
            delete newCompetencies[id];
            return { ...prev, competencies: newCompetencies };
        });
    };

    const guidance = WIZARD_GUIDANCE.competency;
    if (!guidance) return null;

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h5" gutterBottom>
                    Define Competencies
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Competencies are high-level roles that orchestrate multiple skills to achieve complex objectives.
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <TextField
                        label="Competency Name"
                        value={competencyName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="Network Engineer"
                        required
                    />
                    <TextField
                        label="Competency ID (auto-generated)"
                        value={competencyId}
                        onChange={(e) => {
                            setCompetencyId(e.target.value);
                            setUseAutoId(false);
                        }}
                        fullWidth
                        margin="normal"
                        placeholder="network_engineer_b2c4"
                        helperText="Auto-generated from name. Edit to customize."
                        disabled={useAutoId && !competencyName}
                    />

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                        Description (Role, Objectives, Guardrails)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Use ## ROLE, ## OBJECTIVE, ## GUARDRAILS sections to structure your competency
                    </Typography>
                    <CognitiveMarkdownEditor
                        value={competencyDescription}
                        onChange={setCompetencyDescription}
                        placeholder="## ROLE&#10;Network reliability engineer&#10;&#10;## OBJECTIVE&#10;Maintain 99.9% uptime&#10;&#10;## GUARDRAILS&#10;- Never modify production without approval"
                        rows={12}
                        categories={['structure', 'markdown', 'reference']}
                    />

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                        Required Skills
                    </Typography>

                    {availableSkills.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                select
                                label="Select Skill"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                <option value="">-- Select a skill --</option>
                                {availableSkills.map(skill => (
                                    <option key={skill} value={skill}>{skill}</option>
                                ))}
                            </TextField>
                            <Button
                                variant="outlined"
                                onClick={handleAddSkill}
                                disabled={!currentSkill}
                            >
                                Add
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No skills defined yet. Define skills first in step 3.
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {requiredSkills.map(skill => (
                            <Chip
                                key={skill}
                                label={skill}
                                onDelete={() => handleRemoveSkill(skill)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddCompetency}
                        sx={{ mt: 2 }}
                    >
                        Add Competency
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Defined Competencies ({competencyIds.length})
                </Typography>
                <List>
                    {competencyIds.map((id) => (
                        <ListItem
                            key={id}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteCompetency(id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={id} secondary="Competency" />
                        </ListItem>
                    ))}
                </List>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <GuidancePanel
                    title={guidance.title}
                    description={guidance.description}
                    items={guidance.items}
                />
            </Grid>
        </Grid>
    );
}
