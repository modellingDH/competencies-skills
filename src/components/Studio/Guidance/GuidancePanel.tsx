import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface GuidanceItem {
    type: 'do' | 'dont' | 'tip';
    text: string;
}

interface GuidancePanelProps {
    title: string;
    description: string;
    items: GuidanceItem[];
}

export function GuidancePanel({ title, description, items }: GuidancePanelProps) {
    return (
        <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'background.paper', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LightbulbIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.primary">
                    Authoring Guide
                </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                {description}
            </Typography>

            <List dense>
                {items.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            {item.type === 'do' && <CheckCircleIcon color="success" fontSize="small" />}
                            {item.type === 'dont' && <CancelIcon color="error" fontSize="small" />}
                            {item.type === 'tip' && <LightbulbIcon color="info" fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                variant: 'body2',
                                color: item.type === 'dont' ? 'text.secondary' : 'text.primary'
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
