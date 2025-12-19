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
        if (this.generator || this.loading) return;
        this.loading = true;
        try {
            // Dynamically import to avoid SSR issues
            const { pipeline, env } = await import('@xenova/transformers');

            // Optional: Configure environment to avoid downloading models from local paths
            // env.allowLocalModels = false;

            // Use a very small model for browser execution
            // Xenova/distilgpt2 is ~80MB, which is acceptable for a "tiny" requirement
            this.generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
                quantized: true,
                progress_callback: (p: any) => {
                    console.log(`Loading model: ${Math.round(p.progress ?? 0)}%`);
                }
            });
        } catch (error) {
            console.error('Failed to load AI model:', error);
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
