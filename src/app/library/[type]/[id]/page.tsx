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

interface PageProps {
    params: Promise<{ type: string; id: string }>;
    searchParams: Promise<{ source?: string; rawUrl?: string; sourceRepoName?: string }>;
}

// Generate static params for all example entities
export async function generateStaticParams() {
    return [
        { type: 'competency', id: 'network_security_analyst' },
        { type: 'competency', id: 'data_pipeline_engineer' },
        { type: 'concept', id: 'sql_injection' },
        { type: 'concept', id: 'oauth2' },
        { type: 'concept', id: 'api_rate_limiting' },
        { type: 'skill', id: 'analyze_log_file' },
        { type: 'skill', id: 'validate_json_schema' },
        { type: 'skill', id: 'parse_api_response' },
        { type: 'tool', id: 'parse_json' },
        { type: 'tool', id: 'regex_match' },
        { type: 'tool', id: 'http_request' },
    ];
}

async function loadEntityContent(type: string, id: string, source?: string, rawUrl?: string): Promise<string | null> {
    try {
        if (source === 'remote' && rawUrl) {
            const response = await fetch(rawUrl);
            return response.ok ? await response.text() : null;
        }

        // Use plural form for directory name: competency → competencies, concept → concepts
        const typeDir = type.endsWith('y') ? type.slice(0, -1) + 'ies' : type + 's';
        const filePath = path.join(process.cwd(), 'public', 'examples', typeDir, `${id}.md`);
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

export default async function EntityDetailPage({ params, searchParams }: PageProps) {
    const { type, id } = await params;
    const { source, rawUrl, sourceRepoName } = await searchParams;
    const content = await loadEntityContent(type, id, source, rawUrl);

    if (!content) {
        notFound();
    }

    const uri = generateURI(type, id);
    const entityName = id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isRemote = source === 'remote';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIconButton href="/library" aria-label="back to library">
                        <ArrowBackIcon />
                    </LinkIconButton>
                    <Box>
                        <Typography variant="h4">
                            {entityName} {isRemote && <Chip label={sourceRepoName || 'Remote'} size="small" variant="outlined" color="info" sx={{ ml: 1 }} />}
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
                        rawUrl={rawUrl || undefined}
                        sourceRepoName={sourceRepoName || undefined}
                        sourceRepoUrl={undefined} // We don't have this in searchParams yet, but it's optional
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
