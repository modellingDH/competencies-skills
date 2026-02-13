'use client';

import { Suspense, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';

import { StudioProvider, useStudio, StudioView } from '@/contexts/StudioContext';
import { Dashboard } from '@/components/Studio/Dashboard/Dashboard';
import { EditorLayout } from '@/components/Studio/Editor/EditorLayout';
import { WizardProvider } from '@/components/Studio/Wizard/WizardContext'; // Keep for now if needed for auth?

// Clean wrapper
function StudioContent() {
    return (
        <StudioProvider>
            <StudioRouter />
        </StudioProvider>
    );
}

function StudioRouter() {
    const { currentView } = useStudio();
    // Maybe sync URL param 'view'

    if (currentView === StudioView.Dashboard) {
        return <Dashboard />;
    }

    return <EditorLayout />;
}

export default function StudioPage() {
    return (
        <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}>Loading Studio...</Box>}>
            <StudioContent />
        </Suspense>
    );
}
