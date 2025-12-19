'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';

import { WizardProvider, useWizard } from '@/components/Studio/Wizard/WizardContext';
import { InstructionsStep } from '@/components/Studio/Wizard/InstructionsStep';
import { UnifiedStudioView } from '@/components/Studio/Wizard/UnifiedStudioView';
import { ValidationStep } from '@/components/Studio/Wizard/ValidationStep';
import { ProjectManager } from '@/services/project_manager';
import { LinkIconButton } from '@/components/LinkComponents';

const steps = ['Instructions', 'Authoring Studio', 'Validation'];

function StudioContent() {
    const { activeStep, setActiveStep, project, handleNext, handleBack, setProject } = useWizard();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync URL with active step on mount
    useEffect(() => {
        const stepParam = searchParams.get('step');
        if (stepParam) {
            const stepIndex = parseInt(stepParam);
            if (stepIndex >= 0 && stepIndex < 3) {
                setActiveStep(stepIndex);
            }
        }
    }, []); // Only on mount

    // Update URL when step changes
    useEffect(() => {
        const currentStep = searchParams.get('step');
        if (currentStep !== String(activeStep)) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('step', String(activeStep));
            router.push(`/studio?${params.toString()}`, { scroll: false });
        }
    }, [activeStep]);

    const handleExport = async () => {
        await ProjectManager.exportProject(project);
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const loadedProject = await ProjectManager.loadProject(file);
            setProject(loadedProject);
            alert(`Project "${loadedProject.name}" loaded successfully!`);
        } catch (error) {
            alert('Failed to load project. Please check the file format.');
            console.error(error);
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <InstructionsStep />;
            case 1:
                return <UnifiedStudioView />;
            case 2:
                return <ValidationStep />;
            default:
                return <InstructionsStep />;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <LinkIconButton href="/" edge="start" color="inherit" aria-label="back" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </LinkIconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Authoring Studio
                        </Typography>

                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<PublicIcon />}
                            component={Link}
                            href="/sources"
                            sx={{ mr: 2 }}
                        >
                            Manage Sources
                        </Button>

                        <Button
                            component="label"
                            variant="outlined"
                            color="inherit"
                            startIcon={<CloudUploadIcon />}
                            sx={{ mr: 2 }}
                        >
                            Import Project
                            <input
                                type="file"
                                hidden
                                accept=".zip"
                                onChange={handleImport}
                            />
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<CloudDownloadIcon />}
                            onClick={handleExport}
                        >
                            Export Project
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepButton onClick={() => setActiveStep(index)}>
                                {label}
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>

                <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
                    {getStepContent(activeStep)}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={activeStep === steps.length - 1}
                    >
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default function StudioPage() {
    return (
        <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Loading Studio...</Box>}>
            <WizardProvider>
                <StudioContent />
            </WizardProvider>
        </Suspense>
    );
}
