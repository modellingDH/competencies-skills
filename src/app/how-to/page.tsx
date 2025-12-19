import { promises as fs } from 'fs';
import path from 'path';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LinkIconButton } from '@/components/LinkComponents';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default async function HowToPage() {
    let content = '';
    try {
        const filePath = path.join(process.cwd(), 'docs', 'guides', 'AI_AGENT_INTEGRATION.md');
        content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error('Error loading How-To guide:', error);
        content = '# Error\nCould not load the guide. Please try again later.';
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIconButton href="/" aria-label="back to home">
                        <ArrowBackIcon />
                    </LinkIconButton>
                    <Box>
                        <Typography variant="h3" gutterBottom>
                            How It Works
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Instructions for integrating Cognitive Skills with your favorite AI agents
                        </Typography>
                    </Box>
                </Box>

                {/* Content */}
                <Paper sx={{ p: 4, borderRadius: 4 }}>
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

                {/* Footer Link */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Want to improve this guide? <br />
                        Edit it on [GitHub](https://github.com/modellingDH/competencies-skills/blob/main/docs/guides/AI_AGENT_INTEGRATION.md)
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
