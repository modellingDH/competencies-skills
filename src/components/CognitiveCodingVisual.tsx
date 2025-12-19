'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

export function CognitiveCodingVisual() {
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;
    // Fallback colors if secondary is not distinct enough or undefined
    const accent1 = '#00C853'; // Green
    const accent2 = '#FFD600'; // Yellow
    const muted = theme.palette.text.disabled;

    // Animation state
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => (t + 1) % 1000);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Helper for floating animation
    const float = (offset: number) => Math.sin((tick + offset) / 20) * 10;
    const pulse = (offset: number) => 1 + Math.sin((tick + offset) / 15) * 0.1;

    return (
        <Box
            sx={{
                width: '100%',
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                bgcolor: 'background.paper', // Or transparent
                borderRadius: 4,
            }}
        >
            <svg width="400" height="300" viewBox="0 0 400 300">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connecting Lines (Neural structure) */}
                <g stroke={muted} strokeWidth="1" opacity="0.3">
                    <line x1="200" y1="150" x2={100} y2={100 + float(0)} />
                    <line x1="200" y1="150" x2={300} y2={100 + float(20)} />
                    <line x1="200" y1="150" x2={100} y2={200 + float(40)} />
                    <line x1="200" y1="150" x2={300} y2={200 + float(60)} />
                </g>

                {/* Cognitive Software Layer Label */}
                <text x="200" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={muted} fontFamily={theme.typography.fontFamily}>
                    COGNITIVE SOFTWARE LAYER
                </text>

                {/* Central "Engine" / Coordinator */}
                <g transform={`translate(200, 150) scale(${pulse(0)})`}>
                    <circle r="45" fill={primary} stroke={theme.palette.background.paper} strokeWidth="4" filter="url(#glow)" />
                    <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily={theme.typography.fontFamily}>GenAI Engine</text>
                </g>

                {/* Satellite Nodes (Competencies, Skills, Tools) */}

                {/* Node 1: Skill (Top Left) */}
                <g transform={`translate(${100}, ${100 + float(0)})`}>
                    <rect x="-30" y="-20" width="60" height="40" rx="6" fill={primary} />
                    <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white" fontFamily={theme.typography.fontFamily}>Skill</text>
                </g>

                {/* Node 2: Competency (Top Right) */}
                <g transform={`translate(${300}, ${100 + float(20)})`}>
                    <rect x="-35" y="-20" width="70" height="40" rx="6" fill={accent2} />
                    <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black" fontFamily={theme.typography.fontFamily}>Role</text>
                </g>

                {/* Node 3: Tool (Bottom Left) */}
                <g transform={`translate(${100}, ${200 + float(40)})`}>
                    <circle r="25" fill={accent1} />
                    <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white" fontFamily={theme.typography.fontFamily}>Tool</text>
                </g>

                {/* Node 4: Concept (Bottom Right) */}
                <g transform={`translate(${300}, ${200 + float(60)})`}>
                    <path d="M0 -25 L25 18 L-25 18 Z" fill={secondary} transform="translate(0,6)" />
                    <text x="0" y="10" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white" fontFamily={theme.typography.fontFamily}>Concept</text>
                </g>

                {/* Data Flow Particles */}
                <circle r="4" fill="white">
                    <animateMotion dur="2s" repeatCount="indefinite" path={`M${100 - 200},${100 + float(0) - 150} L0,0`} />
                </circle>
                <circle r="4" fill="white">
                    <animateMotion dur="3s" repeatCount="indefinite" path={`M${300 - 200},${100 + float(20) - 150} L0,0`} />
                </circle>

            </svg>
        </Box>
    );
}
