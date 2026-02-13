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
        this.loading = false;
        console.log("AI Validator init (stubbed - using global AI)");
        return;
    }

    async suggestFix(entityType: string, content: string, error: string): Promise<string> {
        return "Please use the 'Get AI Fix' button which now uses the main AI model.";
    }
}
