// Removed top-level import to prevent SSR crashes in Next.js
// @xenova/transformers is imported dynamically in the init() method.

export class AIValidator {
    private static instance: AIValidator;
    private generator: any = null;
    private loading: boolean = false;

    private constructor() { }

    static getInstance(): AIValidator {
        if (!AIValidator.instance) {
            AIValidator.instance = new AIValidator();
        }
        return AIValidator.instance;
    }

    async init() {
        if (typeof window === 'undefined') return; // Ensure we only run on client

        // Return if already initialized or loading
        if (this.generator) return;
        if (this.loading) return;

        this.loading = true;
        try {
            // Dynamically import to avoid SSR issues
            // @ts-ignore
            const { pipeline, env } = await import('@xenova/transformers');

            // Allow local models to be loaded if available, but don't crash if not
            if (env) {
                env.allowLocalModels = false;
                env.useBrowserCache = true;
            }

            // Use a very small model for browser execution
            this.generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
                quantized: true,
                progress_callback: (p: any) => {
                    if (p.status === 'progress') {
                        console.log(`Loading model: ${Math.round(p.progress ?? 0)}%`);
                    }
                }
            });
            console.log("AI Model loaded successfully");
        } catch (error) {
            console.error('Failed to load AI model:', error);
            this.generator = null; // Ensure generator is null on failure
        } finally {
            this.loading = false;
        }
    }

    async suggestFix(entityType: string, content: string, error: string): Promise<string> {
        if (!this.generator) {
            await this.init();
        }
        if (!this.generator) return 'AI model not loaded.';

        const prompt = `Fix this ${entityType} error: "${error}". 
Content:
${content}

Solution:`;

        try {
            const out = await this.generator(prompt, {
                max_new_tokens: 50,
                temperature: 0.7,
                top_k: 50,
            });
            return out[0].generated_text.replace(prompt, '').trim();
        } catch (error) {
            console.error('AI suggestion failed:', error);
            return 'Failed to generate suggestion.';
        }
    }
}
