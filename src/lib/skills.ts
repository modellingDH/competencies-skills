import fs from 'fs';
import path from 'path';
import { Interpreter } from '../interpreter/md_to_jsonld';

const skillsDir = path.join(process.cwd(), 'src/data/skills');

export interface SkillEntry {
    id: string;
    name: string;
    jsonld: any;
}

export function getAllSkills(): SkillEntry[] {
    if (!fs.existsSync(skillsDir)) {
        return [];
    }

    const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));
    const interpreter = new Interpreter();

    return files.map(file => {
        const filePath = path.join(skillsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const id = file.replace('.md', '');

        // Parse using Interpreter
        // Note: Skill name defaults to filename relative id, or extracted from content if we improved parsing
        const jsonld = interpreter.process(content, id);

        return {
            id,
            name: jsonld.name || id,
            jsonld
        };
    });
}
export function getSkillById(id: string): SkillEntry | null {
    const filePath = path.join(skillsDir, `${id}.md`);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf-8');
    const interpreter = new Interpreter();
    const jsonld = interpreter.process(content, id);

    return {
        id,
        name: jsonld.name || id,
        jsonld
    };
}
