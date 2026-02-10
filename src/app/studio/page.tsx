'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import GitHubIcon from '@mui/icons-material/GitHub';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useAI } from '@/contexts/AIContext';

import { WizardProvider, useWizard } from '@/components/Studio/Wizard/WizardContext';
import { InstructionsStep } from '@/components/Studio/Wizard/InstructionsStep';
import { UnifiedStudioView } from '@/components/Studio/Wizard/UnifiedStudioView';
import { ValidationStep } from '@/components/Studio/Wizard/ValidationStep';
import { LinkIconButton } from '@/components/LinkComponents';
import { SettingsDialog } from '@/components/Studio/Settings/SettingsDialog';

const steps = ['Instructions', 'Authoring Studio', 'Validation'];

function StudioContent() {
    const {
        activeStep,
        setActiveStep,
        handleNext,
        handleBack,
        isSettingsOpen,
        toggleSettings,
        driveUser,
        githubUser
    } = useWizard();
    const router = useRouter();
    const { isModelReady } = useAI();
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

                        {/* Status Indicators */}
                        <IconButton
                            color={driveUser ? "success" : "inherit"}
                            onClick={() => toggleSettings(true, 1)}
                            title={driveUser ? `Drive: ${driveUser}` : "Drive: Not Connected"}
                            sx={{ mr: 1 }}
                        >
                            <CloudQueueIcon />
                        </IconButton>

                        <IconButton
                            color={githubUser ? "secondary" : "inherit"}
                            onClick={() => toggleSettings(true, 1)}
                            title={githubUser ? `GitHub: ${githubUser}` : "GitHub: Not Connected"}
                            sx={{ mr: 1 }}
                        >
                            <GitHubIcon />
                        </IconButton>

                        <IconButton
                            color={isModelReady ? "success" : "inherit"}
                            onClick={() => toggleSettings(true, 2)}
                            title={isModelReady ? "AI Writing Assist: Ready" : "AI Writing Assist: Off (Click to configure)"}
                            sx={{ mr: 1 }}
                        >
                            <AutoAwesomeIcon />
                        </IconButton>

                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<SettingsIcon />}
                            onClick={() => toggleSettings(true, 0)}
                            sx={{ ml: 1 }}
                        >
                            Settings
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                        {activeStep === 0 && "Step 1: Instructions"}
                        {activeStep === 1 && "Step 2: Writer"}
                        {activeStep === 2 && "Step 3: Validation"}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            size="small"
                        >
                            {activeStep === 0 ? "Back" : activeStep === 1 ? "Instructions" : "Write"}
                        </Button>
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={activeStep === steps.length - 1}
                            size="small"
                        >
                            {activeStep === 0 ? "Start Writing" : activeStep === 1 ? "Validate" : "Finish"}
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {getStepContent(activeStep)}
                </Box>
            </Box>
            {isSettingsOpen && <SettingsDialog open={isSettingsOpen} onClose={() => toggleSettings(false)} />}
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
