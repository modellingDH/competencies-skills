import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import Zod Schemas
import { CompetencySchema } from '@/schemas/competency.schema';
import { SkillSchema } from '@/schemas/skill.schema';
import { ToolSchema } from '@/schemas/tool.schema';
import { ConceptSchema } from '@/schemas/concept.schema';
import { LinkIconButton } from '@/components/LinkComponents';
import { ExampleViewer } from '@/components/ExampleViewer';

const SCHEMAS: Record<string, any> = {
    competency: CompetencySchema,
    skill: SkillSchema,
    tool: ToolSchema,
    concept: ConceptSchema,
};

export default async function SchemaPage({ params }: { params: Promise<{ type: string }> }) {
    const { type: rawType } = await params;
    const type = rawType.toLowerCase();
    const schema = SCHEMAS[type];

    if (!schema) {
        notFound();
    }

    // Extract Zod definition description if possible, or use hardcoded
    const def = {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        comment: schema.description || "A schema definition.",
        subClassOf: type === 'skill' ? 'schema:HowTo' :
            type === 'competency' ? 'schema:Role' :
                type === 'tool' ? 'schema:SoftwareApplication' :
                    type === 'concept' ? 'schema:DefinedTerm' : 'schema:Thing'
    };

    // Extract properties from Zod schema shapes
    // This is a simplification; in a real app we'd parse the Zod object recursively
    const properties = Object.keys(schema.shape).map(key => ({
        id: key,
        type: "Text", // Placeholder simplification
        comment: `Property definition for ${key}`
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar position="sticky">
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <LinkIconButton href="/" edge="start" color="inherit" aria-label="back" sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </LinkIconButton>
                        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary', '& .MuiBreadcrumbs-separator': { color: 'inherit' } }}>
                            <Link href="/" color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
                            <Typography color="text.primary">{def.name}</Typography>
                        </Breadcrumbs>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
                <Box mb={4}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 400 }}>
                        {def.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`Canonical URL: http://schema.org/${def.name}`} size="small" variant="outlined" />
                        <Chip label={`Subclass of: ${def.subClassOf}`} size="small" color="primary" variant="outlined" />
                    </Box>
                </Box>

                {/* Description Box */}
                <Paper variant="outlined" sx={{ p: 3, mb: 6, bgcolor: 'action.hover', borderRadius: 4, borderLeft: 6, borderColor: 'primary.main' }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {def.comment}
                    </Typography>
                </Paper>

                {/* Properties Table */}
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', mb: 6 }}>
                    <Box sx={{ bgcolor: 'action.hover', px: 3, py: 2, borderBottom: '1px solid #e0e2e8' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                            Properties from {def.name}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Expected Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {properties.map((prop) => (
                                    <TableRow key={prop.id} hover>
                                        <TableCell component="th" scope="row" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                            {prop.id}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                            {prop.type}
                                        </TableCell>
                                        <TableCell>
                                            {prop.comment}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Example Viewer */}
                <ExampleViewer type={type} />

            </Container>
        </Box>
    );
}

export async function generateStaticParams() {
    return Object.keys(SCHEMAS).map((type) => ({
        type,
    }));
}
