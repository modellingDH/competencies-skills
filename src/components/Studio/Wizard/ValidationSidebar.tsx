import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { ValidationState, SuggestedAction } from '@/hooks/useStudioIntelligence';

interface ValidationSidebarProps {
    validation: ValidationState;
    suggestions: SuggestedAction[];
    onActionSelect: (action: SuggestedAction) => void;
}

export function ValidationSidebar({ validation, suggestions, onActionSelect }: ValidationSidebarProps) {
    const theme = useTheme();

    // Determine status for each section, with defensive checks
    if (!validation) return null;

    const structureStatus = !validation.structure?.valid ? 'error' : 'success';
    const contentStatus = !validation.content?.valid ? 'warning' : 'success';
    const linksStatus = !validation.links?.valid ? 'error' : 'success';
    // Polish is warning if score is low, success otherwise. 
    // If score is 0 (initial), treating as 'info' ensures "Pending analysis..." is shown.
    const polishStatus = (validation.polish?.score ?? 0) < 80 ? ((validation.polish?.score ?? 0) === 0 ? 'info' : 'warning') : 'success';

    const getColor = (status: string) => {
        switch (status) {
            case 'error': return theme.palette.error.main;
            case 'warning': return theme.palette.warning.main;
            case 'success': return theme.palette.success.main;
            default: return theme.palette.info.main;
        }
    };

    const renderSegment = (label: string, status: string, errors: string[], stage: string) => (
        <Tooltip
            title={
                <Box>
                    <strong>{label}</strong>
                    {(errors || []).map((e, i) => <div key={i}>• {typeof e === 'string' ? e : String(e)}</div>)}
                    {(errors || []).length === 0 && status === 'success' && <div>All checks passed</div>}
                    {(errors || []).length === 0 && status !== 'success' && <div>Pending analysis...</div>}
                </Box>
            }
            placement="left"
        >
            <Box
                onClick={(e) => {
                    e.stopPropagation();
                    const action = suggestions.find(s => s.stage === stage);
                    if (action) onActionSelect(action);
                }}
                sx={{
                    flex: 1,
                    width: '100%',
                    bgcolor: alpha(getColor(status), 0.2),
                    borderLeft: `2px solid ${getColor(status)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(getColor(status), 0.4) },
                    transition: 'all 0.2s',
                    position: 'relative'
                }}
            >
                {status === 'success' && <CheckCircleIcon sx={{ fontSize: 10, color: getColor(status) }} />}
                {status === 'error' && <ErrorIcon sx={{ fontSize: 10, color: getColor(status) }} />}
                {status === 'warning' && <WarningIcon sx={{ fontSize: 10, color: getColor(status) }} />}
                {status === 'info' && <AutoAwesomeIcon sx={{ fontSize: 10, color: getColor(status) }} />}
            </Box>
        </Tooltip>
    );

    return (
        <Box
            sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 16,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                zIndex: 10
            }}
        >
            {renderSegment('Structure', structureStatus, validation.structure?.errors, 'structure')}
            {renderSegment('Content', contentStatus, validation.content?.warnings, 'content')}
            {renderSegment('Links', linksStatus, [...(validation.links?.missing || []), ...(validation.links?.broken || [])], 'links')}
            {renderSegment('Polish', polishStatus, validation.polish?.suggestions, 'polish')}
        </Box>
    );
}
