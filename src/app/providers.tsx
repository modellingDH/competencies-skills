'use client'

import { SessionProvider } from "next-auth/react"
import { WizardProvider } from "@/components/Studio/Wizard/WizardContext"
import { AIProvider } from "../contexts/AIContext" // Need adjusting path?

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            session={null}
            refetchInterval={0}
            refetchOnWindowFocus={false}
        >
            <AIProvider>
                <WizardProvider>
                    {children}
                </WizardProvider>
            </AIProvider>
        </SessionProvider>
    )
}
