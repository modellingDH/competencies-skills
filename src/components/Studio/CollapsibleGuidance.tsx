'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { GuidancePanel } from './Guidance/GuidancePanel';
import { WIZARD_GUIDANCE } from './Wizard/guidance-config';

interface CollapsibleGuidanceProps {
    activeGuidance: string;
    onOpenGuidance?: (openFn: () => void) => void;
}

export function CollapsibleGuidance({ activeGuidance, onOpenGuidance }: CollapsibleGuidanceProps) {
    const [open, setOpen] = useState(false);
    const guidance = WIZARD_GUIDANCE[activeGuidance];

    // Expose the open function to parent
    useEffect(() => {
        if (onOpenGuidance) {
            onOpenGuidance(() => setOpen(true));
        }
    }, [onOpenGuidance]);

    // Fallback if guidance not found
    if (!guidance) {
        console.warn(`No guidance found for type: ${activeGuidance}`);
        return null;
    }

    return (
        <>
            {/* Help Button for Header */}
            <IconButton
                color="inherit"
                onClick={() => setOpen(true)}
                aria-label="Show authoring guidance"
                size="large"
            >
                <HelpOutlineIcon />
            </IconButton>

            {/* Slide-out Drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 400 },
                        p: 3
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Authoring Guidance</Typography>
                    <IconButton onClick={() => setOpen(false)} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <GuidancePanel
                    title={guidance.title}
                    description={guidance.description}
                    items={guidance.items}
                />

                <Accordion sx={{ mt: 2 }} defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Markdown Reference</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', lineHeight: 1.8 }}>
                            <strong>Structure:</strong><br />
                            ## Heading<br />
                            ### Sub-heading<br />
                            1. Numbered step<br />
                            - Bullet point<br />
                            **Bold text**<br />
                            <br />
                            <strong>Links:</strong><br />
                            [Name](/library/type/id)<br />
                            [External](https://...)<br />
                            <br />
                            <em>Use standard markdown links to reference library entities</em>
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Drawer>
        </>
    );
}
