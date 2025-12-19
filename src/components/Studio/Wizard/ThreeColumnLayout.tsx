'use client';

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { EntitySidebar } from '../EntitySidebar';
import { GuidanceSidebar } from '../GuidanceSidebar';
import { WIZARD_GUIDANCE } from './guidance-config';

interface ThreeColumnLayoutProps {
    children: ReactNode;
    guidanceType: keyof typeof WIZARD_GUIDANCE;
    onEntityDragStart?: (type: string, id: string) => void;
}

export function ThreeColumnLayout({
    children,
    guidanceType,
    onEntityDragStart = () => { }
}: ThreeColumnLayoutProps) {
    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
            {/* Left Sidebar - Entities */}
            <Box sx={{ width: 250, flexShrink: 0, overflow: 'auto' }}>
                <EntitySidebar onEntityDragStart={onEntityDragStart} />
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                {children}
            </Box>

            {/* Right Sidebar - Guidance */}
            <Box sx={{ width: 320, flexShrink: 0 }}>
                <GuidanceSidebar activeGuidance={guidanceType} />
            </Box>
        </Box>
    );
}
