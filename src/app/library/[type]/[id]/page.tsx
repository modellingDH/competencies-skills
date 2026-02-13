import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LinkIconButton } from '@/components/LinkComponents';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';
import { SYSTEM_ENTITIES } from '@/lib/system-skills';

interface PageProps {
    params: Promise<{ type: string; id: string }>;
    searchParams: Promise<{ source?: string; rawUrl?: string; sourceRepoName?: string }>;
}

// Generate static params for all entities
export async function generateStaticParams() {
    console.log('[DEBUG] Generating params from CWD:', process.cwd());
    const types = ['competencies', 'concepts', 'skills', 'tools', 'meta-skills', 'checklists'];
    const params = [];

    for (const pluralType of types) {
        // Singularization logic
        let singularType = pluralType.slice(0, -1);
        if (pluralType === 'competencies') singularType = 'competency';

        const typeDir = path.join(process.cwd(), 'library', pluralType);
        try {
            console.log(`[DEBUG] Reading dir: ${typeDir}`);
            const files = await fs.readdir(typeDir);
            for (const file of files) {
                if (file.endsWith('.md')) {
                    params.push({
                        type: singularType,
                        id: file.replace('.md', '')
                    });
                }
            }
        } catch (e) {
            console.warn(`[WARN] Creating params failed for ${typeDir}:`, e);
        }
    }
    console.log(`[DEBUG] Generated ${params.length} static params.`);

    // Add system entities
    for (const entity of SYSTEM_ENTITIES) {
        params.push({
            type: entity.type,
            id: entity.id
        });
    }
    console.log(`[DEBUG] Total params (incl. system): ${params.length}`);
    return params;
}

async function loadEntityContent(type: string, id: string): Promise<string | null> {
    // Check system entities first
    const systemEntity = SYSTEM_ENTITIES.find(e => e.id === id && e.type === type);
    if (systemEntity) return systemEntity.content;

    try {
        // Use plural form for directory name: competency → competencies, concept → concepts
        const typeDir = type.endsWith('y') ? type.slice(0, -1) + 'ies' : type + 's';
        const filePath = path.join(process.cwd(), 'library', typeDir, `${id}.md`);
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Error loading entity:', error);
        return null;
    }
}

function generateURI(type: string, id: string): string {
    return `https://modellingdh.github.io/competencies-skills/entities/${type}/${id}`;
}

export default async function EntityDetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
    const { type, id } = await params;
    const content = await loadEntityContent(type, id);

    if (!content) {
        notFound();
    }

    const uri = generateURI(type, id);
    const entityName = id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIconButton href="/library" aria-label="back to library">
                        <ArrowBackIcon />
                    </LinkIconButton>
                    <Box>
                        <Typography variant="h4">
                            {entityName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={type} size="small" color="primary" sx={{ textTransform: 'capitalize' }} />
                        </Box>
                    </Box>
                </Box>

                {/* URI and Actions */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Entity URI
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'grey.100',
                            p: 1,
                            borderRadius: 1,
                            mb: 2
                        }}
                    >
                        {uri}
                    </Typography>
                    <CopyButton
                        uri={uri}
                        content={content}
                        id={id}
                        type={type as any}
                    />
                </Paper>

                {/* Content */}
                <Paper sx={{ p: 4 }}>
                    <ReactMarkdown
                        components={{
                            code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus as any}
                                        language={match[1]}
                                        PreTag="div"
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </Paper>

                {/* Usage Instructions */}
                <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" gutterBottom>
                        How to Use This Entity
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Reference this {type} in your agent prompts using its URI or markdown content:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'white',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto'
                    }}>
                        {`You are an AI agent with the following ${type}:\n\n${content.substring(0, 200)}...`}
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
