
import fs from 'fs';
import path from 'path';

const LIBRARY_DIR = path.join(process.cwd(), 'library');
const REGISTRY_FILE = path.join(process.cwd(), 'registry.json');

const TYPES = ['skills', 'competencies', 'tools', 'concepts', 'meta-skills'];

interface Entity {
    id: string;
    name: string;
    type: string;
    description: string;
    tags: string[];
    path: string;
}

function parseFrontmatter(content: string): any {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter = match[1] || '';
    const data: any = {};

    frontmatter.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length < 2) return;

        const key = (parts[0] || '').trim();
        let value = parts.slice(1).join(':').trim();

        // Handle array
        if (value.startsWith('[') && value.endsWith(']')) {
            const arrayContent = value.slice(1, -1);
            data[key] = arrayContent.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        } else {
            data[key] = value.replace(/^['"]|['"]$/g, '');
        }
    });

    return data;
}

async function main() {
    console.log('Generating registry.json from library content...');

    const registry = {
        name: "Standard Library",
        description: "Official Competencies & Skills Library",
        updated_at: new Date().toISOString(),
        entities: [] as Entity[]
    };

    for (const type of TYPES) {
        const typeDir = path.join(LIBRARY_DIR, type);
        if (!fs.existsSync(typeDir)) continue;

        const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.md'));

        for (const file of files) {
            const content = fs.readFileSync(path.join(typeDir, file), 'utf-8');
            const meta = parseFrontmatter(content);

            // Fallback if meta is missing
            const id = meta.id || file.replace('.md', '');
            const name = meta.name || id;

            // Fix pluralization
            let singularType = type.slice(0, -1);
            if (type === 'competencies') singularType = 'competency';

            // Extract description from body if not in frontmatter
            let description = meta.description;
            if (!description || description === '') {
                // Try to find description in body: **Description**: ...
                const descMatch = content.match(/\*\*Description\*\*: (.*)/);
                if (descMatch) {
                    description = (descMatch[1] || '').trim();
                } else {
                    // Or just first paragraph? No, safer to leave empty if not explicit
                    // Actually, let's verify if 'description:' exists in frontmatter
                }
            }

            registry.entities.push({
                id,
                name,
                type: singularType,
                description: description || '',
                tags: meta.tags || [],
                path: `library/${type}/${file}`
            });
        }
    }

    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
    console.log(`registry.json updated with ${registry.entities.length} entities.`);
}

main().catch(console.error);
