import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { CognitiveMarkdownEditor } from './CognitiveMarkdownEditor';
import { ThreeColumnLayout } from './ThreeColumnLayout';
import { useWizard } from './WizardContext';
import { generateId } from '@/utils/id-generator';

export function SkillStep() {
    const { project, updateProject } = useWizard();
    const [currentSkillId, setCurrentSkillId] = useState('');
    const [skillName, setSkillName] = useState('');
    const [skillDescription, setSkillDescription] = useState('');
    const [skillWorkflow, setSkillWorkflow] = useState('');
    const [useAutoId, setUseAutoId] = useState(true);

    const skillIds = Object.keys(project.skills);

    // Auto-generate ID when name changes (if auto-ID is enabled)
    const handleNameChange = (name: string) => {
        setSkillName(name);
        if (useAutoId && name) {
            setCurrentSkillId(generateId(name));
        }
    };

    const handleAddSkill = () => {
        const finalId = currentSkillId || generateId(skillName);

        if (!finalId || !skillName) {
            alert('Please provide a Name for the skill');
            return;
        }

        const markdownContent = `---
id: ${finalId}
name: ${skillName}
description: ${skillDescription}
---

# COGNITIVE WORKFLOW
${skillWorkflow}
`;

        updateProject((prev) => ({
            ...prev,
            skills: {
                ...prev.skills,
                [finalId]: markdownContent
            }
        }));

        // Reset form
        setCurrentSkillId('');
        setSkillName('');
        setSkillDescription('');
        setSkillWorkflow('');
        setUseAutoId(true);
    };

    const handleDeleteSkill = (id: string) => {
        updateProject((prev) => {
            const newSkills = { ...prev.skills };
            delete newSkills[id];
            return { ...prev, skills: newSkills };
        });
    };

    return (
        <ThreeColumnLayout guidanceType="skill">
            <Typography variant="h5" gutterBottom>
                Define Skills
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Skills are instructional modules that teach an agent how to perform specific tasks.
            </Typography>

            {/* Skill Form */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    label="Skill Name"
                    value={skillName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    fullWidth
                    margin="normal"
                    placeholder="Network Diagnosis"
                    required
                />
                <TextField
                    label="Skill ID (auto-generated)"
                    value={currentSkillId}
                    onChange={(e) => {
                        setCurrentSkillId(e.target.value);
                        setUseAutoId(false);
                    }}
                    fullWidth
                    margin="normal"
                    placeholder="network_diagnosis_a3f2"
                    helperText="Auto-generated from name. Edit to customize."
                    disabled={useAutoId && !skillName}
                />
                <TextField
                    label="Description (for Router)"
                    value={skillDescription}
                    onChange={(e) => setSkillDescription(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    placeholder="Diagnoses network connectivity issues using ping and traceroute."
                />

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Cognitive Workflow (Mental Model)
                </Typography>
                <CognitiveMarkdownEditor
                    value={skillWorkflow}
                    onChange={setSkillWorkflow}
                    placeholder="# Cognitive Workflow&#10;- @ CONTEXT: Check system status..."
                    categories={['cognitive', 'markdown', 'reference']}
                />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSkill}
                    sx={{ mt: 2 }}
                >
                    Add Skill
                </Button>
            </Box>

            {/* Skills List */}
            <Typography variant="h6" gutterBottom>
                Defined Skills ({skillIds.length})
            </Typography>
            <List>
                {skillIds.map((id) => (
                    <ListItem
                        key={id}
                        secondaryAction={
                            <IconButton edge="end" onClick={() => handleDeleteSkill(id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={id} secondary="Skill" />
                    </ListItem>
                ))}
            </List>
        </ThreeColumnLayout>
    );
}
