import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { z } from 'zod';

/**
 * Definition of the JSON-LD Output (Schema.org HowTo)
 */
/**
 * Definition of the JSON-LD Output (Schema.org HowTo)
 */
export interface JsonLdStep {
    "@type": "HowToStep" | "HowToDirection" | "HowToTip";
    name?: string;
    text: string;
    itemListElement?: JsonLdStep[];
    instrument?: { "@id": string }; // Tool Reference
}

export interface JsonLdWorkflow {
    "@context": "https://schema.org";
    "@type": "HowTo";
    name: string;
    step: JsonLdStep[];
}

/**
 * Interpreter Class
 * Parses structured markdown (Nested Lists with Keywords) into JSON-LD.
 */
export class Interpreter {

    private parser = unified().use(remarkParse);

    /**
     * Main Entry: Convert Markdown String -> JSON-LD Object
     */
    process(markdown: string, skillName: string): JsonLdWorkflow {
        const tree = this.parser.parse(markdown);
        const steps: JsonLdStep[] = [];

        visit(tree, 'listItem', (node: any) => {
            // 1. Extract Text from List Item
            const paragraph = node.children.find((c: any) => c.type === 'paragraph');
            if (!paragraph) return;

            const textNode = paragraph.children.find((c: any) => c.type === 'text');
            if (!textNode) return;

            const rawText = textNode.value.trim();

            // 2. Parse Cognitive Keywords
            const step = this.parseStep(rawText);

            // 3. Handle Nested Lists (Recursion) -> mapped to `itemListElement`
            const nestedList = node.children.find((c: any) => c.type === 'list');
            if (nestedList) {
                // Logic to recurse would go here. 
                // For a flat demo, we assume structured parsing logic is needed here.
                // This is a simplified version. structure requires preserving hierarchy.
            }

            steps.push(step);
        });

        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: skillName,
            step: steps
        };
    }

    /**
     * Parses a single line to identify Action/Decision/Context
     */
    private parseStep(text: string): JsonLdStep {
        if (text.startsWith('> ACTION:')) {
            const content = text.replace('> ACTION:', '').trim();
            // Extract Tool ID if present: `tool_name()`
            const toolMatch = content.match(/`([a-zA-Z0-9_]+)\(\)`/);

            return {
                "@type": "HowToStep",
                name: "Action",
                text: content,
                ...(toolMatch ? { instrument: { "@id": `http://library.io/tools/${toolMatch[1]}` } } : {})
            };
        }

        if (text.startsWith('? DECISION:')) {
            return {
                "@type": "HowToStep",
                name: "Decision",
                text: text.replace('? DECISION:', '').trim(),
            };
        }

        if (text.startsWith('@ CONTEXT:')) {
            return {
                "@type": "HowToStep", // Mapped to Pre-condition or Direction
                name: "Context Check",
                text: text.replace('@ CONTEXT:', '').trim()
            };
        }

        if (text.startsWith('! CRITICAL:')) {
            return {
                "@type": "HowToTip", // Schema.org Tip is suitable for warnings
                name: "Safety Critical",
                text: text.replace('! CRITICAL:', '').trim()
            }
        }

        // Default/Fallback
        return {
            "@type": "HowToDirection",
            text: text
        };
    }
}
