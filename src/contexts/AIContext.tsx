'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { CreateMLCEngine, MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";

// Using Gemma-2-2b-it quantized models from MLC
// "gemma-2-2b-it-q4f32_1-MLC" or "gemma-2b-it-q4f32_1"
const MODEL_ID = "gemma-2-2b-it-q4f32_1-MLC";

interface AIContextType {
    isModelLoading: boolean;
    isModelReady: boolean;
    loadModel: () => Promise<void>;
    generate: (prompt: string, systemPrompt?: string) => Promise<string>;
    unloadModel: () => Promise<void>;
    downloadProgress: InitProgressReport | null;
    error: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isModelReady, setIsModelReady] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<InitProgressReport | null>(null);
    const [error, setError] = useState<string | null>(null);



    const loadModel = useCallback(async () => {
        if (isModelReady || (typeof window !== 'undefined' && (window as any).isModelLoadingInternal)) return;

        // localized flag because set state is async
        (window as any).isModelLoadingInternal = true;
        setIsModelLoading(true);
        setError(null);

        try {
            // Persist preference
            localStorage.setItem('competencies_ai_auto_load', 'true');

            // Use CreateMLCEngine which manages the worker/engine cycle
            // Re-using the same engine instance isn't always simple with web-llm across re-renders if utilizing React state strictly
            // But here we just create a new one.
            const newEngine = await CreateMLCEngine(
                MODEL_ID,
                {
                    initProgressCallback: (report: InitProgressReport) => {
                        setDownloadProgress(report);
                    },
                    logLevel: "INFO", // Optional: better debugging
                }
            );
            setEngine(newEngine);
            setIsModelReady(true);
        } catch (err: any) {
            console.error("Failed to load model:", err);
            setError(err.message || "Failed to load AI model.");
            setIsModelReady(false);
            localStorage.removeItem('competencies_ai_auto_load'); // Disable auto-load on failure
        } finally {
            setIsModelLoading(false);
            (window as any).isModelLoadingInternal = false;
        }
    }, [isModelReady]);

    const generate = useCallback(async (prompt: string, systemPrompt?: string) => {
        if (!engine || !isModelReady) {
            throw new Error("AI Model not ready");
        }

        const messages = [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
        ];

        try {
            const reply = await engine.chat.completions.create({
                messages: messages as any, // Type cast for strict compatibility
                temperature: 0.7,
            });
            return reply.choices[0]?.message?.content || "";
        } catch (err: any) {
            console.error("Generation error:", err);
            throw err;
        }
    }, [engine, isModelReady]);

    const unloadModel = useCallback(async () => {
        localStorage.removeItem('competencies_ai_auto_load');
        if (engine) {
            await engine.unload();
            setEngine(null);
            setIsModelReady(false);
            setDownloadProgress(null);
        }
    }, [engine]);

    // Auto-load on mount if previously enabled
    useEffect(() => {
        const autoLoad = localStorage.getItem('competencies_ai_auto_load');
        if (autoLoad === 'true') {
            loadModel();
        }
    }, []); // Only on mount



    return (
        <AIContext.Provider value={{
            isModelLoading,
            isModelReady,
            loadModel,
            generate,
            unloadModel,
            downloadProgress,
            error
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}
