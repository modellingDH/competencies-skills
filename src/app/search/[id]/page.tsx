import Link from 'next/link';
import { getSkillById, getAllSkills } from '@/lib/skills';
Breadcrumbs,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default async function SkillPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const skill = getSkillById(id);

    if (!skill) {
        return <div className="p-24">Skill not found</div>;
    }

    const { jsonld } = skill;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar position="sticky">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <IconButton component={Link} href="/search" edge="start" color="inherit" aria-label="back" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', '& .MuiBreadcrumbs-separator': { color: 'inherit' } }}>
                            <Link href="/" color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
                            <Link href="/search" color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>Skills</Link>
                            <Typography color="text.primary">{skill.name}</Typography>
                        </Breadcrumbs>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Main Content */}
            <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
                <Box mb={4}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 400 }}>
                        {skill.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`ID: ${skill.id}`} size="small" variant="outlined" />
                        <Chip label={`Type: ${jsonld['@type']}`} size="small" color="primary" variant="outlined" />
                    </Box>
                </Box>

                {/* Definition Card */}
                <Paper variant="outlined" sx={{ borderRadius: 4, mb: 6, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: 'action.hover', px: 3, py: 2, borderBottom: '1px solid #e0e2e8' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                            Definition
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ width: '25%', verticalAlign: 'top', color: 'text.secondary', fontFamily: 'monospace' }}>name</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{jsonld.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ width: '25%', verticalAlign: 'top', color: 'text.secondary', fontFamily: 'monospace' }}>description</TableCell>
                                    <TableCell>
                                        {jsonld.description || <Typography component="span" fontStyle="italic" color="text.secondary">No description</Typography>}
                                    </TableCell>
                                </TableRow>

                                {/* Steps Sub-table */}
                                {jsonld.step?.map((step: any, idx: number) => (
                                    <TableRow key={idx} sx={{ bgcolor: 'background.default' }}>
                                        <TableCell sx={{ width: '25%', verticalAlign: 'top', color: 'primary.main', fontFamily: 'monospace' }}>
                                            step.{idx + 1}
                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', mt: 0.5 }}>
                                                {step['@type']}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" gutterBottom fontStyle="medium">{step.name || "Action Step"}</Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>{step.text}</Typography>
                                            {step.instrument && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">TOOL</Typography>
                                                    <Chip label={step.instrument['@id']} size="small" sx={{ borderRadius: 1, fontFamily: 'monospace' }} />
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* JSON-LD Block */}
                <Paper elevation={3} sx={{ bgcolor: '#1a1c1e', color: '#fff', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#aaa' }}>
                            JSON-LD Output
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#666' }}>
                            application/ld+json
                        </Typography>
                    </Box>
                    <Box sx={{ p: 3, overflowX: 'auto' }}>
                        <Typography component="pre" variant="caption" sx={{ fontFamily: 'monospace', color: '#e3e3e3', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(jsonld, null, 2)}
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

// Generate static params for static export
export async function generateStaticParams() {
    const skills = getAllSkills();
    return skills.map((skill) => ({
        id: skill.id,
    }));
}
