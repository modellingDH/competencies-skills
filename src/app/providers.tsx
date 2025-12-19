'use client'

import { SessionProvider } from "next-auth/react"
import { WizardProvider } from "@/components/Studio/Wizard/WizardContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <WizardProvider>
                {children}
            </WizardProvider>
        </SessionProvider>
    )
}
