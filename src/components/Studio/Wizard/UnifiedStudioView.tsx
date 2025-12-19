'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { EntityNavigation } from '../EntityNavigation';
import { CollapsibleGuidance } from '../CollapsibleGuidance';
import { EntityEditor } from './EntityEditor';
import { useWizard } from './WizardContext';
import { generateId } from '@/utils/id-generator';
import { WIZARD_GUIDANCE } from './guidance-config';

export function UnifiedStudioView() {
    const { updateProject } = useWizard();
    const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string } | null>(null);
    const [openGuidanceFn, setOpenGuidanceFn] = useState<(() => void) | null>(null);

    const handleSelectEntity = (type: string, id: string) => {
        setSelectedEntity({ type, id });
    };

    const handleCreateEntity = (type: string, name: string) => {
        const id = generateId(name);
        const entityType = type.slice(0, -1); // Remove 's' from plural

        // Create empty entity
        updateProject((prev) => ({
            ...prev,
            [type]: {
                ...prev[type as keyof typeof prev],
                [id]: `---\nid: ${id}\nname: ${name}\n---\n\n# Content goes here`
            }
        }));

        // Select the new entity
        setSelectedEntity({ type: entityType, id });
    };

    const handleDeleteEntity = (type: string, id: string) => {
        if (!confirm(`Delete ${type} "${id}"?`)) return;

        updateProject((prev) => {
            const typeKey = `${type}s` as keyof typeof prev;
            const updated = { ...prev[typeKey] };
            delete updated[id];
            return { ...prev, [typeKey]: updated };
        });

        // Clear selection if deleted entity was selected
        if (selectedEntity?.type === type && selectedEntity?.id === id) {
            setSelectedEntity(null);
        }
    };

    const getGuidanceType = (): keyof typeof WIZARD_GUIDANCE => {
        if (!selectedEntity) return 'skill';
        const type = selectedEntity.type;
        // Ensure the type is a valid key
        if (type === 'competency' || type === 'concept' || type === 'skill' || type === 'tool') {
            return type;
        }
        return 'skill'; // fallback
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            {/* Header with Help Button */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Typography variant="h6">
                    {selectedEntity ? `Editing: ${selectedEntity.id}` : 'Authoring Studio'}
                </Typography>
                <CollapsibleGuidance
                    activeGuidance={getGuidanceType()}
                    onOpenGuidance={useCallback((fn: () => void) => setOpenGuidanceFn(() => fn), [])}
                />
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left: Entity Navigation */}
                <Box sx={{ width: 280, flexShrink: 0, overflow: 'auto' }}>
                    <EntityNavigation
                        selectedEntity={selectedEntity}
                        onSelectEntity={handleSelectEntity}
                        onCreateEntity={handleCreateEntity}
                        onDeleteEntity={handleDeleteEntity}
                    />
                </Box>

                {/* Center: Entity Editor */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.default' }}>
                    {selectedEntity ? (
                        <EntityEditor
                            type={selectedEntity.type as 'competency' | 'concept' | 'skill' | 'tool'}
                            id={selectedEntity.id}
                            onOpenGuidance={openGuidanceFn}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
                            <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
                                <Typography variant="h5" gutterBottom>
                                    Welcome to the Authoring Studio
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Create and edit your competencies, concepts, skills, and tools using the navigator on the left.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Click the <strong>+</strong> button next to any category to create a new entity, or select an existing one to edit.
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
