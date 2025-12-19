import Link from 'next/link';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SecurityIcon from '@mui/icons-material/Security';

import { LinkButton } from '@/components/LinkComponents';

export default function Home() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Top App Bar */}
            <AppBar position="sticky">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        {/* Logo Placeholder - replaced with Image when valid */}
                        <Avatar
                            src="/cognitive_library_logo.webp"
                            alt="Logo"
                            sx={{ mr: 2, bgcolor: 'transparent', width: 40, height: 40 }}
                            imgProps={{ style: { objectFit: 'contain' } }}
                        >
                            <Box component="span" sx={{ fontSize: 24, fontWeight: 'bold' }}>C</Box>
                        </Avatar>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', lineHeight: 1 }}>
                                The Cognitive Library<Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main', ml: 0.5 }}>for AI</Box>
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            <LinkButton href="/library" color="inherit" sx={{ color: 'text.secondary' }}>Library Explorer</LinkButton>
                            <LinkButton href="/studio" color="inherit" sx={{ color: 'text.secondary' }}>Authoring Studio</LinkButton>
                            <LinkButton href="https://schema.org" target="_blank" color="inherit" sx={{ color: 'text.secondary' }}>Schemas</LinkButton>
                            <LinkButton href="https://github.com/modellingDH/competencies-skills" color="inherit" sx={{ color: 'text.secondary' }}>GitHub</LinkButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 8 }}>
                {/* Hero Section */}
                <Box textAlign="center" mb={10}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 400 }}>
                        The Cognitive Library
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: 800, mx: 'auto' }}>
                        Standardized schemas for <Box component="span" color="primary.main" fontWeight="medium">Teaching AI Agents</Box>.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <LinkButton href="/library" variant="contained" size="large" sx={{ borderRadius: 50, px: 4 }}>
                            Library Explorer
                        </LinkButton>
                        <LinkButton href="/sources" variant="outlined" size="large" sx={{ borderRadius: 50, px: 4 }}>
                            Manage Sources
                        </LinkButton>
                        <LinkButton href="/studio" variant="outlined" size="large" sx={{ borderRadius: 50, px: 4 }}>
                            Authoring Studio
                        </LinkButton>
                    </Box>
                </Box>

                {/* Rationale Section */}
                <Box sx={{ mb: 12, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                            Cognitive Coding for GenAI
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph fontSize={18}>
                            Generative AI models are powerful <strong>engines</strong> capable of manipulating representations of the world. However, the software that drives them isn't code—it's interpretation strategies.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph fontSize={18}>
                            This project builds a library of reusable <strong>Cognitive Building Blocks</strong> (Competencies, Skills, Concepts, and Tools) to facilitate this new form of programming. Instead of writing prompts from scratch, you assemble verified cognitive modules.
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, bgcolor: 'primary.light', borderRadius: 4, opacity: 0.1 }}>
                        <AccountTreeIcon sx={{ fontSize: 160, color: 'primary.main' }} />
                    </Box>
                </Box>

                {/* Features Cards */}
                <Grid container spacing={4} mb={12}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', borderRadius: 4 }} variant="outlined">
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white', mr: 2 }}>
                                        <AccountTreeIcon />
                                    </Avatar>
                                    <Typography variant="h5">Hierarchy</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    Organized types aligning with Schema.org's Action and HowTo definitions.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', borderRadius: 4 }} variant="outlined">
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white', mr: 2 }}>
                                        <PsychologyIcon />
                                    </Avatar>
                                    <Typography variant="h5">Cognition</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    Specialized Cognitive Markdown for defining mental models that are human-readable.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', borderRadius: 4 }} variant="outlined">
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white', mr: 2 }}>
                                        <SecurityIcon />
                                    </Avatar>
                                    <Typography variant="h5">Reliability</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    Clear separation between Instructional Modules (Skills) and Atomic Capabilities (Tools).
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* How It Works Section */}
                <Box sx={{ mb: 12 }}>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 400 }}>
                            How It Works
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            A standardized workflow for teaching AI new capabilities.
                        </Typography>
                    </Box>

                    <Grid container spacing={6}>
                        {/* Step 1: Create */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 64, height: 64, mx: 'auto', bgcolor: 'primary.main', mb: 3 }}>
                                    <AccountTreeIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography variant="h5" gutterBottom>1. Create</Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Use the **Authoring Studio** to define Skills and Competencies using
                                    standardized schemas and Cognitive Markdown.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Step 2: Explore */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 64, height: 64, mx: 'auto', bgcolor: 'primary.main', mb: 3 }}>
                                    <PsychologyIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography variant="h5" gutterBottom>2. Explore</Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Browse the **Library Explorer** to find existing modules, or link
                                    external GitHub repositories to expand your federated library.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Step 3: Use */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 64, height: 64, mx: 'auto', bgcolor: 'primary.main', mb: 3 }}>
                                    <SecurityIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography variant="h5" gutterBottom>3. Use</Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Inject your defined logic into agents like **Gemini, OpenAI, Claude,**
                                    or orchestrators like **n8n** for deterministic execution.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <LinkButton href="/how-to" variant="outlined" color="primary" sx={{ px: 4, py: 1.5, borderRadius: 50, fontWeight: 'bold' }}>
                            View Agent Integration Guide
                        </LinkButton>
                    </Box>
                </Box>

                {/* Federated Library Section */}
                <Box sx={{ mb: 12, p: 6, borderRadius: 4, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Connect to the Federated Ecosystem
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                                Don't rewrite what has already been taught. The Cognitive Library allows you to bootstrap your project by importing specialized repositories from across the community.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 16 }}>1</Avatar>
                                    <Typography variant="body1">
                                        <strong>Find a Source:</strong> Copy the URL of any GitHub repository containing a <code>registry.json</code> file.
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 16 }}>2</Avatar>
                                    <Typography variant="body1">
                                        <strong>Link it:</strong> Go to the <Link href="/sources" style={{ color: 'inherit', fontWeight: 'bold' }}>Manage Sources</Link> dashboard and paste the registry URL.
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 16 }}>3</Avatar>
                                    <Typography variant="body1">
                                        <strong>Sync & Use:</strong> The library will instantly index all remote entities, making them available for reference and cloning in the Studio.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: 'center' }}>
                            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'inherit', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Community Libraries</Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>Trusted repositories to get you started:</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Chip label="Standard Library (Built-in)" size="small" sx={{ bgcolor: 'primary.main', color: 'white' }} />
                                        <Chip label="Cybersecurity Pack (Remote)" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                        <Chip label="DevOps Modules (Remote)" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Core Definitions Section (Modified for consistency) */}
                <Box mb={10}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                        Schema Standards
                    </Typography>
                    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 4, border: '1px solid #e0e2e8', overflow: 'hidden' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TYPE</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>PARENT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>DESCRIPTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow hover>
                                    <TableCell component="th" scope="row">
                                        <Link href="/schemas/skill" style={{ textDecoration: 'none', color: '#0b51c5', fontWeight: 500 }}>
                                            Skill
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>schema:HowTo</TableCell>
                                    <TableCell>An instructional module that teaches an agent <strong>how</strong> to perform a task.</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell component="th" scope="row">
                                        <Link href="/schemas/competency" style={{ textDecoration: 'none', color: '#0b51c5', fontWeight: 500 }}>
                                            Competency
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>schema:Role</TableCell>
                                    <TableCell>A higher-order role that orchestrates multiple Skills.</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell component="th" scope="row">
                                        <Link href="/schemas/tool" style={{ textDecoration: 'none', color: '#0b51c5', fontWeight: 500 }}>
                                            Tool
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>schema:SoftwareApp</TableCell>
                                    <TableCell>An atomic, deterministic capability (e.g. API/Function).</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell component="th" scope="row">
                                        <Link href="/schemas/concept" style={{ textDecoration: 'none', color: '#0b51c5', fontWeight: 500 }}>
                                            Concept
                                        </Link>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>schema:DefinedTerm</TableCell>
                                    <TableCell>A shared vocabulary term or domain definition.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container>

            {/* Footer */}
            <Box component="footer" sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', mt: 'auto' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary">
                        Aligned with Schema.org • Apache 2.0 License
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

