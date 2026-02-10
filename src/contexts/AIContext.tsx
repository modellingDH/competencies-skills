'use client';

import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
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
        if (isModelReady || isModelLoading) return;

        setIsModelLoading(true);
        setError(null);
        try {
            const newEngine = await CreateMLCEngine(
                MODEL_ID,
                {
                    initProgressCallback: (report: InitProgressReport) => {
                        setDownloadProgress(report);
                    }
                }
            );
            setEngine(newEngine);
            setIsModelReady(true);
        } catch (err: any) {
            console.error("Failed to load model:", err);
            setError(err.message || "Failed to load AI model.");
            setIsModelReady(false);
        } finally {
            setIsModelLoading(false);
        }
    }, [isModelReady, isModelLoading]);

    const generate = useCallback(async (prompt: string, systemPrompt?: string) => {
        if (!engine || !isModelReady) {
            throw new Error("AI Model not ready");
        }

        const messages = [
            ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
            { role: "user" as const, content: prompt }
        ];

        try {
            const reply = await engine.chat.completions.create({
                messages,
                temperature: 0.7,
            });
            return reply.choices[0]?.message?.content || "";
        } catch (err: any) {
            console.error("Generation error:", err);
            throw err;
        }
    }, [engine, isModelReady]);

    const unloadModel = useCallback(async () => {
        if (engine) {
            await engine.unload();
            setEngine(null);
            setIsModelReady(false);
            setDownloadProgress(null);
        }
    }, [engine]);

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
