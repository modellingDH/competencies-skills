import { useState, useEffect } from 'react';
import { AIValidator } from '@/lib/ai-validator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PendingIcon from '@mui/icons-material/Pending';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CircularProgress from '@mui/material/CircularProgress';
import { useWizard } from './WizardContext';

interface ValidationResult {
    entityType: 'competency' | 'concept' | 'skill' | 'tool';
    entityId: string;
    status: 'pending' | 'validating' | 'success' | 'error' | 'warning';
    message: string;
    details?: string[];
    aiSuggestion?: string;
    isGeneratingAI?: boolean;
}

export function ValidationStep() {
    const { project, remoteEntities } = useWizard();
    const [isValidating, setIsValidating] = useState(false);
    const [results, setResults] = useState<ValidationResult[]>([]);
    const [currentStep, setCurrentStep] = useState('');
    const [progress, setProgress] = useState(0);
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

    useEffect(() => {
        const loadAI = async () => {
            setAiStatus('loading');
            try {
                const validator = AIValidator.getInstance();
                await validator.init();
                setAiStatus('ready');
            } catch (error) {
                console.error('AI load failed:', error);
                setAiStatus('error');
            }
        };
        loadAI();
    }, []);

    const generateAIFix = async (idx: number, result: ValidationResult, content: string) => {
        if (aiStatus !== 'ready') return;

        setResults(prev => {
            const next = [...prev];
            const item = next[idx];
            if (item) {
                next[idx] = { ...item, isGeneratingAI: true };
            }
            return next;
        });

        try {
            const validator = AIValidator.getInstance();
            const suggestion = await validator.suggestFix(result.entityType, content, result.message);

            setResults(prev => {
                const next = [...prev];
                const item = next[idx];
                if (item) {
                    next[idx] = { ...item, isGeneratingAI: false, aiSuggestion: suggestion };
                }
                return next;
            });
        } catch (error) {
            console.error('AI Generation failed', error);
            setResults(prev => {
                const next = [...prev];
                const item = next[idx];
                if (item) {
                    next[idx] = { ...item, isGeneratingAI: false, aiSuggestion: 'Failed to generate suggestion.' };
                }
                return next;
            });
        }
    };

    const validateEntity = async (type: string, id: string, content: string): Promise<ValidationResult> => {
        // Simulate validation delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const errors: string[] = [];
        const warnings: string[] = [];

        // Check if content has frontmatter
        if (!content.includes('---')) {
            errors.push('Missing frontmatter');
        }

        // Check for required fields based on type
        if (type === 'competency') {
            if (!content.includes('## ROLE')) warnings.push('Missing ## ROLE section');
            if (!content.includes('## OBJECTIVE')) warnings.push('Missing ## OBJECTIVE section');
            if (!content.includes('## GUARDRAILS')) warnings.push('Missing ## GUARDRAILS section');
        } else if (type === 'skill') {
            if (!content.includes('# Cognitive Workflow') && !content.includes('## Workflow')) {
                warnings.push('Missing cognitive workflow section');
            }
            // Check for cognitive notations
            const hasCognitiveNotations = />|@|\?|!/.test(content);
            if (!hasCognitiveNotations) {
                warnings.push('No cognitive notations found (>, @, ?, !)');
            }
        } else if (type === 'concept') {
            if (!content.includes('## Definition')) {
                warnings.push('Missing ## Definition section');
            }
        } else if (type === 'tool') {
            if (!content.includes('## Parameters')) {
                warnings.push('Missing ## Parameters section');
            }
        }

        // Check for broken references
        const references = content.match(/@(skill|concept|tool|competency):(\w+)/g) || [];
        for (const ref of references) {
            const match = ref.match(/@(skill|concept|tool|competency):(\w+)/);
            if (!match) continue;
            const [, refType, refId] = match;
            if (!refType || !refId) continue;

            // Check Local
            const collection = `${refType}s` as keyof typeof project;
            const existsLocally = project[collection] && (project[collection] as any)[refId];

            // Check Remote
            const existsRemotely = remoteEntities.some(e => e.type === refType && e.id === refId);

            if (!existsLocally && !existsRemotely) {
                errors.push(`Broken reference: ${ref} (entity doesn't exist locally or in remote repos)`);
            }
        }

        // Type-specific relationship validation
        if (type === 'competency') {
            const skillRefs = references.filter(r => r.startsWith('@skill:'));
            if (skillRefs.length === 0) {
                warnings.push('Competency has no skill references (should orchestrate skills)');
            }
        } else if (type === 'skill') {
            const toolRefs = references.filter(r => r.startsWith('@tool:'));
            if (toolRefs.length === 0) {
                warnings.push('Skill has no tool references (skills typically use tools)');
            }
        }

        // Determine status
        let status: ValidationResult['status'] = 'success';
        let message = 'Valid';

        if (errors.length > 0) {
            status = 'error';
            message = `${errors.length} error(s) found`;
        } else if (warnings.length > 0) {
            status = 'warning';
            message = `${warnings.length} warning(s)`;
        }

        return {
            entityType: type as any,
            entityId: id,
            status,
            message,
            details: [...errors, ...warnings]
        };
    };

    const handleStartValidation = async () => {
        setIsValidating(true);
        setResults([]);
        setProgress(0);

        const allEntities: Array<{ type: string; id: string; content: string }> = [];

        // Gather all entities
        Object.entries(project.competencies).forEach(([id, content]) => {
            if (content) allEntities.push({ type: 'competency', id, content: content as string });
        });
        Object.entries(project.concepts).forEach(([id, content]) => {
            if (content) allEntities.push({ type: 'concept', id, content: content as string });
        });
        Object.entries(project.skills).forEach(([id, content]) => {
            if (content) allEntities.push({ type: 'skill', id, content: content as string });
        });
        Object.entries(project.tools).forEach(([id, content]) => {
            if (content) allEntities.push({ type: 'tool', id, content: content as string });
        });

        const total = allEntities.length;

        // Validate each entity
        for (let i = 0; i < allEntities.length; i++) {
            const entity = allEntities[i];
            if (!entity) continue;
            setCurrentStep(`Validating ${entity.type}: ${entity.id}`);

            const result = await validateEntity(entity.type, entity.id, entity.content);

            setResults(prev => [...prev, result]);
            setProgress(((i + 1) / total) * 100);
        }

        setCurrentStep('Validation complete');
        setIsValidating(false);
    };

    const getStatusIcon = (status: ValidationResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            case 'validating':
                return <PendingIcon color="info" className="rotating" />;
            default:
                return <PendingIcon color="disabled" />;
        }
    };

    const getStatusColor = (status: ValidationResult['status']) => {
        switch (status) {
            case 'success': return 'success';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'default';
        }
    };

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Validation & Export
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Validate your entities for completeness and consistency before exporting.
            </Typography>

            <Box sx={{ mt: 4, mb: 3 }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartValidation}
                    disabled={isValidating}
                >
                    {isValidating ? 'Validating...' : 'Start Validation'}
                </Button>
            </Box>

            {isValidating && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        {currentStep}
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {Math.round(progress)}% complete
                    </Typography>
                </Paper>
            )}

            {results.length > 0 && (
                <>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                                icon={<CheckCircleIcon />}
                                label={`${successCount} Passed`}
                                color="success"
                                variant={successCount > 0 ? 'filled' : 'outlined'}
                            />
                            <Chip
                                icon={<WarningIcon />}
                                label={`${warningCount} Warnings`}
                                color="warning"
                                variant={warningCount > 0 ? 'filled' : 'outlined'}
                            />
                            <Chip
                                icon={<ErrorIcon />}
                                label={`${errorCount} Errors`}
                                color="error"
                                variant={errorCount > 0 ? 'filled' : 'outlined'}
                            />
                        </Box>
                    </Paper>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Validation Results
                    </Typography>

                    <List>
                        {results.map((result, idx) => (
                            <Paper key={idx} sx={{ mb: 1 }}>
                                <ListItem>
                                    <ListItemIcon>
                                        {getStatusIcon(result.status)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" component="span" sx={{ fontFamily: 'monospace' }}>
                                                    {result.entityId}
                                                </Typography>
                                                <Chip
                                                    label={result.entityType}
                                                    size="small"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                                <Chip
                                                    label={result.message}
                                                    size="small"
                                                    color={getStatusColor(result.status)}
                                                    variant="outlined"
                                                    sx={{ ml: 'auto' }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                {result.details && result.details.length > 0 && (
                                                    <Box component="ul" sx={{ mt: 1, pl: 2, mb: 1 }}>
                                                        {result.details.map((detail, i) => (
                                                            <Typography key={i} variant="caption" component="li" color="text.secondary">
                                                                {detail}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                )}
                                                {result.status !== 'success' && (
                                                    <Box sx={{ mt: 1 }}>
                                                        {result.aiSuggestion ? (
                                                            <Alert
                                                                severity="info"
                                                                variant="outlined"
                                                                sx={{ py: 0, '& .MuiAlert-message': { width: '100%', overflow: 'hidden' } }}
                                                                action={
                                                                    <Button
                                                                        size="small"
                                                                        color="inherit"
                                                                        onClick={() => navigator.clipboard.writeText(result.aiSuggestion || '')}
                                                                    >
                                                                        Copy Fix
                                                                    </Button>
                                                                }
                                                            >
                                                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                                                    AI Fix Suggestion:
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', display: 'block' }}>
                                                                    {result.aiSuggestion}
                                                                </Typography>
                                                            </Alert>
                                                        ) : (
                                                            <Button
                                                                size="small"
                                                                startIcon={result.isGeneratingAI ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                                                                disabled={!!(aiStatus !== 'ready' || result.isGeneratingAI)}
                                                                onClick={() => {
                                                                    const collection = project[`${result.entityType}s` as keyof typeof project] as Record<string, string>;
                                                                    const content = collection[result.entityId];
                                                                    if (content) generateAIFix(idx, result, content);
                                                                }}
                                                            >
                                                                {aiStatus === 'ready' ? 'Get AI Fix' : (aiStatus === 'loading' ? 'AI Loading...' : 'AI Unavailable')}
                                                            </Button>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </Paper>
                        ))}
                    </List>

                    {errorCount === 0 && !isValidating && (
                        <>
                            <Divider sx={{ my: 4 }} />
                            <Alert severity="success" sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    ✅ Validation Successful!
                                </Typography>
                                <Typography variant="body2">
                                    All entities have been validated. You can now export your work.
                                </Typography>
                            </Alert>

                            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                                <Typography variant="h6" gutterBottom>
                                    Next Steps: GitHub Submission
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Your validated entities are ready for submission. Follow these steps:
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="1. Export your entities as markdown files"
                                            secondary="Use the export button in the header"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="2. Create a new branch in your repository"
                                            secondary="git checkout -b feat/your-contribution"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="3. Commit and push your changes"
                                            secondary="Ensure all files are properly formatted"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="4. Create a Pull Request"
                                            secondary="Include a description of your contribution"
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
