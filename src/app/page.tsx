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
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2, fontWeight: 'bold' }}>S</Avatar>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', lineHeight: 1 }}>
                                Schema<Box component="span" sx={{ fontWeight: 'bold' }}>.org</Box>
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                                AI Extension
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            <LinkButton href="/search" color="inherit" sx={{ color: 'text.secondary' }}>Discovery</LinkButton>
                            <LinkButton href="/studio" color="inherit" sx={{ color: 'text.secondary' }}>Studio</LinkButton>
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
                            Explore Library
                        </LinkButton>
                        <LinkButton href="/sources" variant="outlined" size="large" sx={{ borderRadius: 50, px: 4 }}>
                            Manage Sources
                        </LinkButton>
                        <LinkButton href="/studio" variant="outlined" size="large" sx={{ borderRadius: 50, px: 4 }}>
                            Open Studio
                        </LinkButton>
                    </Box>
                </Box>

                {/* Features Cards */}
                <Grid container spacing={4} mb={12}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', borderRadius: 4 }} variant="outlined">
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
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
                                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
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
                                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
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
                                    Browse the **Discovery Portal** to find existing modules, or link
                                    external GitHub repositories to expand your local library.
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

