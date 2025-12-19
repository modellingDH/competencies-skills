import Link from 'next/link';
import { getAllSkills } from '@/lib/skills';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchPage() {
    const skills = getAllSkills();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Simple Top Bar */}
            <AppBar position="sticky">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <IconButton component={Link} href="/" edge="start" color="inherit" aria-label="back" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
                            Discovery Portal
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
                {/* Search Bar Placeholder */}
                <Box mb={6} sx={{ maxWidth: 600 }}>
                    <TextField
                        fullWidth
                        placeholder="Search skills..."
                        variant="outlined"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 50, bgcolor: 'background.paper' }
                            }
                        }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {skills.map(skill => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={skill.id}>
                            <Card sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 } }} variant="outlined">
                                <CardActionArea component={Link} href={`/search/${skill.id}`} sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Chip
                                                label={skill.jsonld['@type'] || 'Skill'}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ borderRadius: 1 }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {skill.jsonld.step?.length || 0} steps
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                            {skill.name}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 'auto' }}>
                                            {skill.jsonld.description || "No description provided."}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}

                    {skills.length === 0 && (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                            <Typography color="text.secondary">No skills found.</Typography>
                        </Box>
                    )}
                </Grid>
            </Container>
        </Box>
    )
}
