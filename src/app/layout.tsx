import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import './globals.css'

export const metadata: Metadata = {
    title: 'AI Skills & Competencies Library',
    description: 'Schema.org-aligned Library for AI Agents',
}

import { Providers } from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Providers>{children}</Providers>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    )
}
