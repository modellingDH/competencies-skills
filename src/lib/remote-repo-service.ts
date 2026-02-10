export interface RemoteEntity {
    id: string;
    name: string;
    type: 'competency' | 'concept' | 'skill' | 'tool' | 'meta-skill';
    description: string;
    tags: string[];
    repositoryUrl: string;
    rawUrl: string;
    sourceRepoName: string;
    sourceRepoUrl: string;
}

export interface RemoteRegistry {
    name: string;
    description: string;
    entities: {
        id: string;
        name: string;
        type: string;
        description: string;
        tags: string[];
        path: string;
    }[];
}

export class RemoteRepositoryService {
    async fetchRegistry(repoUrl: string): Promise<RemoteEntity[]> {
        try {
            // Assume repoUrl is like https://github.com/user/repo
            // Convert to raw content URL for registry.json
            let rawBase = repoUrl;
            if (repoUrl.includes('github.com') && !repoUrl.includes('raw.githubusercontent.com')) {
                rawBase = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main';
            }

            const response = await fetch(`${rawBase}/registry.json`);

            if (!response.ok) {
                console.warn(`Failed to fetch registry from ${repoUrl}: ${response.status} ${response.statusText}`);
                return [];
            }

            const registry: RemoteRegistry = await response.json();

            return registry.entities.map(e => ({
                ...e,
                type: e.type as any,
                repositoryUrl: repoUrl,
                rawUrl: `${rawBase}/${e.path}`,
                sourceRepoName: registry.name,
                sourceRepoUrl: repoUrl
            }));
        } catch (error) {
            console.error(`Error fetching remote registry from ${repoUrl}:`, error);
            return [];
        }
    }

    async fetchEntityContent(rawUrl: string): Promise<string | null> {
        try {
            const response = await fetch(rawUrl);
            if (!response.ok) return null;
            return await response.text();
        } catch (error) {
            console.error('Error fetching entity content:', error);
            return null;
        }
    }
}
