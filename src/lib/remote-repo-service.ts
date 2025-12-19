export interface RemoteEntity {
    id: string;
    name: string;
    type: 'competency' | 'concept' | 'skill' | 'tool';
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
            const rawBase = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main';
            const response = await fetch(`${rawBase}/registry.json`);

            if (!response.ok) {
                throw new Error(`Failed to fetch registry from ${repoUrl}`);
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
            console.error('Error fetching remote registry:', error);
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
