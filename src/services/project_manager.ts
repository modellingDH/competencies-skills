import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Type definitions for our in-memory project state
export interface RemoteRepo {
    url: string;
    name: string;
    enabled: boolean;
}

export interface ProjectState {
    name: string;
    competencies: Record<string, string>; // ID -> Markdown Content
    skills: Record<string, string>;       // ID -> Markdown Content
    tools: Record<string, string>;        // ID -> Markdown Content
    concepts: Record<string, string>;     // ID -> Markdown Content
    metaSkills: Record<string, string>;     // ID -> Markdown Content
    remoteRepositories: RemoteRepo[];     // List of remote repository objects
}

export const INITIAL_PROJECT_STATE: ProjectState = {
    name: 'Untitled Project',
    competencies: {},
    skills: {},
    tools: {},
    concepts: {},
    metaSkills: {},
    remoteRepositories: [
        {
            url: 'https://github.com/modellingDH/competencies-skills',
            name: 'Official Registry',
            enabled: true
        }
    ]
};

export class ProjectManager {

    /**
     * Exports the current project state to a ZIP file.
     * The ZIP adheres to the repository structure:
     * - /competencies
     * - /skills
     * - /tools
     * - /concepts
     * - /meta-skills
     */
    static async exportProject(state: ProjectState): Promise<void> {
        const zip = new JSZip();

        // Competencies
        const compFolder = zip.folder("competencies");
        Object.entries(state.competencies).forEach(([id, content]) => {
            compFolder?.file(`${id}.md`, content);
        });

        // Skills
        const skillFolder = zip.folder("skills");
        Object.entries(state.skills).forEach(([id, content]) => {
            skillFolder?.file(`${id}.md`, content);
        });

        // Tools
        const toolFolder = zip.folder("tools");
        Object.entries(state.tools).forEach(([id, content]) => {
            toolFolder?.file(`${id}.md`, content);
        });

        // Concepts
        const conceptFolder = zip.folder("concepts");
        Object.entries(state.concepts).forEach(([id, content]) => {
            conceptFolder?.file(`${id}.md`, content);
        });

        // Meta Skills
        const metaFolder = zip.folder("meta-skills");
        Object.entries(state.metaSkills || {}).forEach(([id, content]) => {
            metaFolder?.file(`${id}.md`, content);
        });

        // Generate and download
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, `${state.name.replace(/\s+/g, '_').toLowerCase()}_export.zip`);
    }

    /**
     * Parses a ZIP file (or folder structure) and returns a ProjectState object.
     * This allows users to "Open" an existing project.
     */
    static async loadProject(file: File): Promise<ProjectState> {
        const zip = await JSZip.loadAsync(file);
        const newState: ProjectState = { ...INITIAL_PROJECT_STATE, name: file.name.replace('.zip', '') };

        // Helper to read folder contents, implemented inline below for simplicity in one pass

        // Re-implementing read logic correctly for JSZip structure
        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir || !relativePath.endsWith('.md')) continue;

            const parts = relativePath.split('/'); // e.g. "skills/diagnose_network.md" 
            if (parts.length < 2) continue; // Root file? Ignore for now.

            const typeDir = parts[0]; // "skills"
            const filename = parts[parts.length - 1]; // "diagnose_network.md"
            if (!filename) continue;

            const id = filename.replace('.md', '');
            const content = await zipEntry.async('string');

            if (typeDir === 'competencies') newState.competencies[id] = content;
            else if (typeDir === 'skills') newState.skills[id] = content;
            else if (typeDir === 'tools') newState.tools[id] = content;
            else if (typeDir === 'concepts') newState.concepts[id] = content;
            else if (typeDir === 'meta-skills') newState.metaSkills[id] = content;
        }

        return newState;
    }
}
