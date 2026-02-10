export interface ElectronAPI {
    openDirectory: () => Promise<string | null>;
    getWorkspacePath: () => Promise<string | null>;
    loadWorkspace: (path: string) => Promise<Record<string, Record<string, string>>>;
    saveFile: (data: { dirPath: string; type: string; id: string; content: string }) => Promise<boolean>;

    // Google Drive
    authenticateGoogleDrive: () => Promise<string | false>;
    getDriveUser: () => Promise<string | null>;
    logoutGoogleDrive: () => Promise<void>;
    listDriveFiles: () => Promise<any[]>;
    // GitHub
    authenticateGitHub: () => Promise<string | false>;
    getGitHubUser: () => Promise<string | null>;
    logoutGitHub: () => Promise<void>;
    createGitHubGist: (data: { name: string; content: string; description?: string }) => Promise<string | null>;
    updateGitHubGist: (data: { gistId: string; name: string; content: string; description?: string }) => Promise<string | null>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
