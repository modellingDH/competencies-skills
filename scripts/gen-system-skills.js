const fs = require('fs');
const path = require('path');
const dirs = [
    { dir: 'meta-skills', type: 'meta-skill' },
    { dir: 'skills', type: 'skill' },
    { dir: 'concepts', type: 'concept' }
];
const entities = [];
for (const { dir, type } of dirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const file of fs.readdirSync(fullDir).filter(f => f.endsWith('.md'))) {
        const content = fs.readFileSync(path.join(fullDir, file), 'utf-8');
        const nameMatch = content.match(/^name:\s*(.*)$/m);
        const idMatch = content.match(/^id:\s*(.*)$/m);
        entities.push({
            id: idMatch ? idMatch[1].trim() : file.replace('.md', ''),
            name: nameMatch ? nameMatch[1].trim() : file.replace('.md', ''),
            type,
            content
        });
    }
}

// Generate TypeScript
let ts = `// AUTO-GENERATED — Do not edit manually.\n// System entities embedded from meta-skills/, skills/, concepts/\n\n`;
ts += `export interface SystemEntity {\n    id: string;\n    name: string;\n    type: 'meta-skill' | 'skill' | 'concept';\n    content: string;\n    source: 'system';\n}\n\n`;
ts += `export const SYSTEM_ENTITIES: SystemEntity[] = [\n`;
for (const e of entities) {
    const escaped = e.content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    ts += `    {\n        id: '${e.id}',\n        name: '${e.name.replace(/'/g, "\\'")}',\n        type: '${e.type}',\n        source: 'system',\n        content: \`${escaped}\`\n    },\n`;
}
ts += `];\n\n`;
ts += `// Default enabled state: all system entities enabled\n`;
ts += `export const DEFAULT_SYSTEM_SKILL_STATES: Record<string, boolean> = Object.fromEntries(\n    SYSTEM_ENTITIES.map(e => [e.id, true])\n);\n`;

fs.writeFileSync(path.join(process.cwd(), 'src/lib/system-skills.ts'), ts);
console.log('Generated system-skills.ts with', entities.length, 'entities');
