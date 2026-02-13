
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SecurityIcon from '@mui/icons-material/Security';
import { LinkButton } from '@/components/LinkComponents';
import Link from 'next/link';

export default function Home() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
            {/* Navigation Bar */}
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Avatar
                            src="/cognitive_library_logo.webp"
                            alt="Logo"
                            sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}
                        >
                            C
                        </Avatar>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 'bold' }}>
                            Cognitive Library
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <LinkButton href="/library" variant="text" color="inherit" sx={{ color: 'text.secondary' }}>Library</LinkButton>
                            <LinkButton href="/studio" variant="text" color="inherit" sx={{ color: 'text.secondary' }}>Studio</LinkButton>
                            <LinkButton href="https://github.com/modellingDH/competencies-skills" target="_blank" variant="outlined" size="small">GitHub</LinkButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 8 }}>

                {/* Hero Section - Lean & Direct */}
                <Box sx={{ textAlign: 'center', mb: 10, maxWidth: 800, mx: 'auto' }}>
                    <Chip
                        label="v3.0: Structured Markdown"
                        size="small"
                        sx={{ mb: 3, bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}
                    />
                    <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}>
                        The <Box component="span" sx={{ color: 'primary.main' }}>Cognitive Library</Box>
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, fontWeight: 400 }}>
                        A curated registry of <strong>Cognitive Skills</strong> for AI Agents.
                        <br />
                        Feed these markdown files directly to your LLM's context window.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <LinkButton href="/library" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, px: 4, py: 1.5 }}>
                            Browse Library
                        </LinkButton>
                        <LinkButton href="/studio" variant="outlined" size="large" sx={{ borderRadius: 2, px: 4, py: 1.5, borderColor: 'divider', color: 'text.primary' }}>
                            AI Studio
                        </LinkButton>
                    </Box>

                    {/* Quick Link to Meta-Skills Guide */}
                    <Box sx={{ mt: 4, display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'secondary.50', px: 2, py: 1, borderRadius: 2 }}>
                        <AutoFixHighIcon fontSize="small" color="secondary" />
                        <Typography variant="caption" fontWeight="bold">
                            New: <Link href="/how-to" style={{ color: 'inherit', textDecoration: 'underline' }}>How to feed skills to AI?</Link>
                        </Typography>
                    </Box>
                </Box>

                {/* The New Workflow: AI Driven */}
                <Box sx={{ mb: 12 }}>
                    <Typography variant="overline" display="block" align="center" color="text.secondary" fontWeight="bold" sx={{ mb: 4, letterSpacing: '0.1em' }}>
                        THE AUTHORING WORKFLOW
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Step 1: Select Meta-Skill */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderColor: 'secondary.200', position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: 'secondary.main' }} />
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ bgcolor: 'secondary.100', color: 'secondary.main', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</Box>
                                    Select Meta-Skill
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Don't write from scratch. Browse existing <strong>Skills</strong> and <strong>Concepts</strong> in the library as templates and guides.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Chip label="Browse Library" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'secondary.50' }} />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Step 2: Generate with AI */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ bgcolor: 'grey.200', color: 'grey.700', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</Box>
                                    Generate
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Paste the skill into your agent's context window. Let AI draft, evaluate, or refine your new skill.
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Step 3: Validate & Register */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ bgcolor: 'grey.200', color: 'grey.700', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</Box>
                                    Register
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Bring the generated markdown into the <strong>Studio</strong>. Review, refine, and save it to the registry.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Dual Usage Section */}
                <Box sx={{ mb: 12, p: 6, borderRadius: 4, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="overline" color="primary" fontWeight="bold">Universal Format</Typography>
                            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                                One Library, <br /> Two Audiences
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                                Skills are written in plain structured markdown — readable by both humans and LLMs. Standard links connect entities into a rich knowledge graph.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">For Agents</Typography>
                                        <Typography variant="body2" color="text.secondary">Processes clear, structured markdown with linked entities for precise, context-rich execution.</Typography>
                                    </Box>
                                </Paper>
                                <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>H</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">For Humans</Typography>
                                        <Typography variant="body2" color="text.secondary">Reads as clear Standard Operating Procedures (SOPs) for training and alignment.</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Footer Links */}
                <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>Ready to start?</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                        <LinkButton href="/how-to" variant="text">Learn how to integrate with AI</LinkButton>
                        <LinkButton href="/library" variant="text">Explore the Library</LinkButton>
                        <LinkButton href="/studio" variant="text">Open Authoring Studio</LinkButton>
                    </Box>
                </Box>

            </Container>
        </Box>
    );
}
