'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GuidancePanel } from './Guidance/GuidancePanel';
import { WIZARD_GUIDANCE, type StepGuidance } from './Wizard/guidance-config';

interface GuidanceSidebarProps {
    activeGuidance: keyof typeof WIZARD_GUIDANCE;
}

export function GuidanceSidebar({ activeGuidance }: GuidanceSidebarProps) {
    const guidance = WIZARD_GUIDANCE[activeGuidance];

    if (!guidance) {
        return null;
    }

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                borderLeft: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                overflow: 'auto',
                position: 'sticky',
                top: 0
            }}
        >
            <Box sx={{ p: 2 }}>
                <GuidancePanel
                    title={guidance.title}
                    description={guidance.description}
                    items={guidance.items}
                />

                <Accordion sx={{ mt: 2 }} defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Cognitive Notation Reference</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', lineHeight: 1.8 }}>
                            <strong>Core:</strong><br />
                            &gt; ACTION: Do something<br />
                            ? DECISION: Question?<br />
                            @ CONTEXT: Check state<br />
                            ! CRITICAL: Safety<br />
                            <br />
                            <strong>Extended:</strong><br />
                            OBSERVE: Check first<br />
                            VALIDATE: Assert condition<br />
                            FAILURE: Handle errors<br />
                            THOUGHT: Reasoning<br />
                            EXAMPLE: Show how<br />
                            <br />
                            <strong>References:</strong><br />
                            @skill:id<br />
                            @concept:id<br />
                            @tool:id
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Paper>
    );
}
