import { CreateMLCEngine, MLCEngine, type InitProgressCallback } from "@mlc-ai/web-llm";

// Default model - can be configured
export const DEFAULT_MODEL = "gemma-2-2b-it-q4f32_1-MLC";

export interface LlmGenerationOptions {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
}

export class LocalLlmService {
    private static instance: LocalLlmService;
    private engine: MLCEngine | null = null;
    private isModelLoaded = false;
    private currentModelId: string | null = null;

    private constructor() { }

    public static getInstance(): LocalLlmService {
        if (!LocalLlmService.instance) {
            LocalLlmService.instance = new LocalLlmService();
        }
        return LocalLlmService.instance;
    }

    public async loadModel(
        modelId: string = DEFAULT_MODEL,
        progressCallback?: InitProgressCallback
    ): Promise<void> {
        if (this.engine && this.currentModelId === modelId && this.isModelLoaded) {
            return; // Already loaded
        }

        try {
            // Create engine (this will trigger download/cache check)
            const config: any = {};
            if (progressCallback) config.initProgressCallback = progressCallback;

            this.engine = await CreateMLCEngine(modelId, config);
            this.currentModelId = modelId;
            this.isModelLoaded = true;
        } catch (error) {
            console.error("Failed to load local LLM:", error);
            this.isModelLoaded = false;
            throw error;
        }
    }

    public async generate(prompt: string, systemPrompt?: string, options?: LlmGenerationOptions): Promise<string> {
        if (!this.engine || !this.isModelLoaded) {
            throw new Error("Model not loaded. Call loadModel() first.");
        }

        const messages = [
            ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
            { role: "user" as const, content: prompt }
        ];

        try {
            const reply = await this.engine.chat.completions.create({
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 1024,
                top_p: options?.top_p ?? 1.0,
            });

            return reply.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Generation failed:", error);
            throw error;
        }
    }

    public isLoaded(): boolean {
        return this.isModelLoaded;
    }

    // Free GPU resources
    public async unload(): Promise<void> {
        if (this.engine) {
            await this.engine.unload();
            this.engine = null;
            this.isModelLoaded = false;
            this.currentModelId = null;
        }
    }
}
