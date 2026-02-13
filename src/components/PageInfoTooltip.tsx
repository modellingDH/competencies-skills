'use client';

import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';

interface PageInfoTooltipProps {
    title: string;
    description: string;
    tips?: string[];
}

export function PageInfoTooltip({ title, description, tips }: PageInfoTooltipProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Page instructions" arrow>
                <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(open ? null : e.currentTarget)}
                    sx={{
                        color: open ? 'primary.main' : 'text.secondary',
                        transition: 'color 0.2s ease',
                    }}
                >
                    {open ? <LightbulbIcon fontSize="small" /> : <LightbulbOutlinedIcon fontSize="small" />}
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        sx: {
                            maxWidth: 340,
                            p: 2.5,
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        }
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {title}
                    </Typography>
                    <IconButton size="small" onClick={() => setAnchorEl(null)} sx={{ mt: -0.5, mr: -0.5 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: tips ? 1.5 : 0, lineHeight: 1.5 }}>
                    {description}
                </Typography>

                {tips && tips.length > 0 && (
                    <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                        {tips.map((tip, i) => (
                            <Typography component="li" variant="caption" color="text.secondary" key={i} sx={{ lineHeight: 1.4 }}>
                                {tip}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Popover>
        </>
    );
}
