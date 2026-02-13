import { Box, Button, Typography, IconButton, InputBase, CircularProgress, Chip, Stack } from '@mui/material';
import { useStudio } from '@/contexts/StudioContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CognitiveMonacoEditor } from '@/components/Studio/Wizard/CognitiveMonacoEditor';
import { ChatSidebar } from '@/components/Studio/Chat/ChatSidebar';
import { SuggestionDialog } from '@/components/Studio/Wizard/SuggestionDialog';
import { SettingsDialog } from '@/components/Studio/Settings/SettingsDialog';
import { useState, useEffect } from 'react';
import TagIcon from '@mui/icons-material/Tag';
import SettingsIcon from '@mui/icons-material/Settings';
import { PageInfoTooltip } from '@/components/PageInfoTooltip';

export function EditorLayout() {
    const { backToDashboard, activeEntity, project, createCompetency } = useStudio();
    const [title, setTitle] = useState('');
    const [suggestedAction, setSuggestedAction] = useState<any>(null);
    const [isApplyingAction, setIsApplyingAction] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [dialogState, setDialogState] = useState<{ open: boolean; content: string; title: string }>({ open: false, content: '', title: '' });

    useEffect(() => {
        if (activeEntity?.type === 'competency') {
            const rawContent = (project.competencies || {})[activeEntity.id];
            const content = typeof rawContent === 'string' ? rawContent : '';
            const match = content.match(/^name:\s*(.*)$/m);
            setTitle((match && match[1]) ? match[1].trim() : activeEntity.id);
        } else {
            setTitle(activeEntity?.id || '');
        }
    }, [activeEntity, project]);

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
    };

    const handleTitleBlur = () => {
        if (activeEntity?.type === 'competency') {
            const rawContent = (project.competencies || {})[activeEntity.id];
            const content = typeof rawContent === 'string' ? rawContent : '';
            const newContent = content.replace(/^name:\s*(.*)$/m, `name: ${title}`);
            if (newContent !== content) {
                createCompetency(activeEntity.id, newContent);
            }
        }
    };

    const handleApplySuggestion = async (action: any) => {
        if (action.apply && !isApplyingAction) {
            setIsApplyingAction(true);
            try {
                const res = await action.apply();
                if (res && typeof res === 'string') {
                    setDialogState({
                        open: true,
                        content: res,
                        title: action.label
                    });
                }
            } catch (e) {
                console.error("Failed to generate suggestion", e);
            } finally {
                setIsApplyingAction(false);
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2, py: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={backToDashboard}
                    size="small"
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <InputBase
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onBlur={handleTitleBlur}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                color: 'text.primary',
                                borderBottom: '1px dashed transparent',
                                '&:hover': { borderBottomColor: 'text.secondary' },
                                '& .MuiInputBase-input': { p: 0 }
                            }}
                            placeholder="Competency Name"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontStyle: 'italic' }}>
                            (Edit to rename)
                        </Typography>
                    </Box>

                    {activeEntity && (
                        <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                            <TagIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                {activeEntity.type}:{activeEntity.id}
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <IconButton onClick={() => setIsSettingsOpen(true)} sx={{ ml: 1 }}>
                    <SettingsIcon color="action" />
                </IconButton>
                <PageInfoTooltip
                    title="Entity Editor"
                    description="Write structured markdown content for your entity. Gemma will provide real-time analysis and suggestions."
                    tips={[
                        'Use ## ROLE, ## OBJECTIVE, and ## BODY sections for skills.',
                        'Link other entities with [Name](/library/type/id) syntax.',
                        'The AI chat sidebar provides contextual writing assistance.',
                    ]}
                />
            </Box>

            <SettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <SuggestionDialog
                open={dialogState.open}
                title={dialogState.title}
                content={dialogState.content}
                onClose={() => setDialogState(prev => ({ ...prev, open: false }))}
                onApply={(content: string) => {
                    if (activeEntity?.type === 'competency') {
                        createCompetency(activeEntity.id, content);
                        setDialogState(prev => ({ ...prev, open: false }));
                    }
                }}
            />

            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Sidebar: AI Chat */}
                <Box sx={{ width: 350, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.default', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                        <ChatSidebar suggestedAction={suggestedAction} onApplyAction={handleApplySuggestion} />
                    </Box>
                </Box>

                {/* Main Content Area: Editor */}
                <Box sx={{ flexGrow: 1, bgcolor: 'secondary.contrastText', p: 0, overflow: 'hidden', position: 'relative' }}>
                    {activeEntity?.type === 'competency' ? (
                        <CognitiveMonacoEditor
                            value={(project.competencies || {})[activeEntity.id] || ''}
                            onChange={(val) => createCompetency(activeEntity.id, val)}
                            project={project}
                            onSuggestionChange={setSuggestedAction}
                            onSearch={(query) => {
                                console.log("Search query from editor:", query);
                            }}
                            fullHeight
                        />
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                            <Typography>Select a Competency to edit</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
