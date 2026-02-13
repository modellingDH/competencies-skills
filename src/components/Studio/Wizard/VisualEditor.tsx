
import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Typography, Divider, Button, Stack, ToggleButton, ToggleButtonGroup, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAI } from '@/contexts/AIContext';

interface Definition {
    type: string;
    id: string;
    name: string;
    content: string;
}

interface StructuredDoc {
    name: string;
    id: string;
    role: string;
    objective: string;
    body: string;
    definitions: Definition[];
}

interface VisualEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function VisualEditor({ value, onChange }: VisualEditorProps) {
    const { generate, isModelReady } = useAI();
    const [doc, setDoc] = useState<StructuredDoc>({ name: '', id: '', role: '', objective: '', body: '', definitions: [] });
    const [rawMode, setRawMode] = useState(false);
    const [metaExpanded, setMetaExpanded] = useState(false);
    const [generatingDefIndex, setGeneratingDefIndex] = useState<number | null>(null);

    // Parse Markdown into Structure
    useEffect(() => {
        if (rawMode) return; // Don't parse if user is editing raw or we risk loop

        const newDoc: StructuredDoc = { name: '', id: '', role: '', objective: '', body: '', definitions: [] };

        // 1. Frontmatter
        const fmMatch = value.match(/^\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
        if (fmMatch && fmMatch[1]) {
            const fm = fmMatch[1];
            const nameMatch = fm.match(/^\s*name:\s*(.+)$/m);
            const idMatch = fm.match(/^\s*id:\s*(.+)$/m);
            if (nameMatch && nameMatch[1]) newDoc.name = nameMatch[1].trim();
            if (idMatch && idMatch[1]) newDoc.id = idMatch[1].trim();
        }

        // 2. Role
        const roleMatch = value.match(/##\s+ROLE\s+([\s\S]*?)(?=##|$)/);
        if (roleMatch && roleMatch[1]) newDoc.role = roleMatch[1].trim();

        // 3. Objective
        const objMatch = value.match(/##\s+OBJECTIVE\s+([\s\S]*?)(?=##|$)/);
        if (objMatch && objMatch[1]) newDoc.objective = objMatch[1].trim();

        // 4. Body & Definitions
        let lastIndex = 0;
        if (objMatch && (objMatch.index !== undefined)) {
            lastIndex = objMatch.index + objMatch[0].length;
        } else if (roleMatch && (roleMatch.index !== undefined)) { // Fallback if no objective
            lastIndex = roleMatch.index + roleMatch[0].length;
        } else if (fmMatch && (fmMatch.index !== undefined)) {
            lastIndex = fmMatch.index + fmMatch[0].length;
        }

        const remaining = value.substring(lastIndex);

        // Extract Definitions
        const defs: Definition[] = [];
        const defRegex = /> DEFINE: @(\w+):(\w+)\s+([\s\S]*?)(?=(> DEFINE:|$))/g;
        let match;
        // loop over copy to avoid stuck loop
        let scan = remaining;
        while ((match = defRegex.exec(scan)) !== null) {
            if (match[1] && match[2] && match[3]) {
                const rawContent = match[3].trim();
                const nameMatch = rawContent.match(/^name:\s*(.*)$/m);
                const name = (nameMatch && nameMatch[1]) ? nameMatch[1].trim() : '';
                const cleanContent = rawContent.replace(/^name:\s*.*$\n*/m, '').trim();
                defs.push({ type: match[1], id: match[2], name, content: cleanContent });
            }
        }

        // Remove from body
        const cleanBody = remaining.replace(/> DEFINE: @(\w+):(\w+)\s+([\s\S]*?)(?=(> DEFINE:|$))/g, '').trim();

        newDoc.body = cleanBody;
        newDoc.definitions = defs;

        setDoc(newDoc);
    }, [value, rawMode]);

    const handleChange = (field: keyof StructuredDoc, content: any) => {
        const nextDoc = { ...doc, [field]: content };

        // Auto-generate ID from Name
        if (field === 'name') {
            nextDoc.id = (content as string).toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        }

        setDoc(nextDoc);
        reconstruct(nextDoc);
    };

    const reconstruct = (nextDoc: StructuredDoc) => {
        let md = '';
        if (nextDoc.name || nextDoc.id) {
            md += `---\n`;
            if (nextDoc.name) md += `name: ${nextDoc.name}\n`;
            if (nextDoc.id) md += `id: ${nextDoc.id}\n`;
            md += `---\n\n`;
        }

        if (nextDoc.role) md += `## ROLE\n${nextDoc.role}\n\n`;
        if (nextDoc.objective) md += `## OBJECTIVE\n${nextDoc.objective}\n\n`;

        md += `${nextDoc.body}\n\n`;

        if (nextDoc.definitions.length > 0) {
            nextDoc.definitions.forEach(def => {
                let content = def.content;
                if (def.name) content = `name: ${def.name}\n\n${content}`;
                md += `> DEFINE: @${def.type}:${def.id}\n${content.trim()}\n\n`;
            });
        }

        onChange(md);
    };

    const handleDefChange = (index: number, field: keyof Definition, val: string) => {
        const newDefs = [...doc.definitions];
        if (!newDefs[index]) return;

        // Use explicit assignment to avoid spread type issues
        const updatedDef = { ...newDefs[index] };
        (updatedDef as any)[field] = val; // safe because all fields are string
        newDefs[index] = updatedDef;

        if (field === 'name') {
            newDefs[index].id = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        }

        handleChange('definitions', newDefs);
    };

    const addDefinition = () => {
        const newDefs = [...doc.definitions, { type: 'concept', id: '', name: '', content: '' }];
        handleChange('definitions', newDefs);
    };

    const removeDefinition = (index: number) => {
        const newDefs = [...doc.definitions];
        newDefs.splice(index, 1);
        handleChange('definitions', newDefs);
    };

    const suggestDescription = async (index: number) => {
        const def = doc.definitions[index];
        if (!def) return;
        if (!def.name && !def.id) return;
        setGeneratingDefIndex(index);

        try {
            const prompt = `Generate a concise, clear description for the ${def.type} "${def.name || def.id}".
Context:
Role: ${doc.role}
Objective: ${doc.objective}
Existing Body: ${doc.body.substring(0, 500)}...

Output ONLY the definition text.`;
            const result = await generate(prompt);
            if (result) {
                handleDefChange(index, 'content', result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingDefIndex(null);
        }
    };

    return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            <Paper elevation={0} sx={{ p: 3, maxWidth: 800, mx: 'auto', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Visual Editor
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Edit the core definition sections. Metadata is managed in the header.
                </Typography>

                <Stack spacing={4}>
                    {/* Metadata (Frontmatter) */}
                    <Accordion expanded={metaExpanded} onChange={() => setMetaExpanded(!metaExpanded)} variant="outlined">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2" color="text.secondary">Document Metadata</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Name"
                                    value={doc.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="ID"
                                    value={doc.id}
                                    disabled
                                    fullWidth
                                    size="small"
                                    helperText="Auto-generated"
                                />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* Role */}
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Role Definition</Typography>
                        <TextField
                            multiline
                            minRows={2}
                            value={doc.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            fullWidth
                            placeholder="Describe the role..."
                            variant="standard"
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.1rem' } }}
                        />
                    </Box>

                    {/* Objective */}
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Objective</Typography>
                        <TextField
                            multiline
                            minRows={2}
                            value={doc.objective}
                            onChange={(e) => handleChange('objective', e.target.value)}
                            fullWidth
                            placeholder="What is the primary objective?"
                            variant="standard"
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.1rem' } }}
                        />
                    </Box>

                    <Divider />

                    {/* Body */}
                    <Box sx={{ minHeight: 200 }}>
                        <TextField
                            multiline
                            minRows={10}
                            value={doc.body}
                            onChange={(e) => handleChange('body', e.target.value)}
                            fullWidth
                            placeholder="Add content..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                        />
                    </Box>

                    <Divider />

                    {/* Definitions Footer */}
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Definitions</Typography>
                            <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={addDefinition}>
                                Add Definition
                            </Button>
                        </Stack>

                        <Stack spacing={3}>
                            {doc.definitions.map((def, idx) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                                value={def.type}
                                                label="Type"
                                                onChange={(e) => handleDefChange(idx, 'type', e.target.value)}
                                            >
                                                <MenuItem value="concept">Concept</MenuItem>
                                                <MenuItem value="skill">Skill</MenuItem>
                                                <MenuItem value="tool">Tool</MenuItem>
                                                <MenuItem value="competency">Competency</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Name"
                                            value={def.name}
                                            onChange={(e) => handleDefChange(idx, 'name', e.target.value)}
                                            size="small"
                                            fullWidth
                                            placeholder="Entity Name"
                                        />

                                        <TextField
                                            label="ID (Auto)"
                                            value={def.id}
                                            disabled
                                            size="small"
                                            sx={{ width: 200 }}
                                        />

                                        <IconButton size="small" onClick={() => removeDefinition(idx)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>

                                    <Box sx={{ mt: 2, position: 'relative' }}>
                                        <TextField
                                            label="Description"
                                            multiline
                                            minRows={2}
                                            value={def.content}
                                            onChange={(e) => handleDefChange(idx, 'content', e.target.value)}
                                            fullWidth
                                            variant="outlined"
                                            placeholder={`Define ${def.name || 'this entity'}...`}
                                        />
                                        <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => suggestDescription(idx)}
                                                disabled={generatingDefIndex === idx || !isModelReady}
                                                title="AI Suggest Description"
                                            >
                                                {generatingDefIndex === idx ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}

                            {doc.definitions.length === 0 && (
                                <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No definitions yet. Add defined entities here.
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
