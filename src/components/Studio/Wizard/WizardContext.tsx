import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { ProjectState } from '@/services/project_manager';
import { INITIAL_PROJECT_STATE } from '@/services/project_manager';
import { RemoteRepositoryService, type RemoteEntity } from '@/lib/remote-repo-service';

interface WizardContextType {
    activeStep: number;
    setActiveStep: (step: number) => void;
    project: ProjectState;
    handleNext: () => void;
    handleBack: () => void;
    updateProject: (updater: (prev: ProjectState) => ProjectState) => void;
    setProject: (state: ProjectState) => void;
    remoteEntities: RemoteEntity[];
    isSyncing: boolean;
    syncRemoteRepos: () => Promise<void>;
    cloneRemoteEntity: (entity: RemoteEntity) => Promise<boolean>;
    toggleRemoteRepo: (url: string) => void;
    removeRemoteRepo: (url: string) => void;
    workspacePath: string | null;
    openWorkspace: () => Promise<void>;
    saveEntityToWorkspace: (type: string, id: string, content: string) => Promise<boolean>;
    isSettingsOpen: boolean;
    settingsTab: number;
    toggleSettings: (open: boolean, tabIndex?: number) => void;
    driveUser: string | null;
    githubUser: string | null;
    refreshAuthStatus: () => Promise<void>;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [activeStep, setActiveStep] = useState(0);
    const [project, setProject] = useState<ProjectState>(INITIAL_PROJECT_STATE);
    const [remoteEntities, setRemoteEntities] = useState<RemoteEntity[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [workspacePath, setWorkspacePath] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState(0);
    const [driveUser, setDriveUser] = useState<string | null>(null);
    const [githubUser, setGithubUser] = useState<string | null>(null);

    const remoteService = useMemo(() => new RemoteRepositoryService(), []);

    const refreshAuthStatus = async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            const drive = await window.electronAPI.getDriveUser?.();
            setDriveUser(drive || null);
            const github = await window.electronAPI.getGitHubUser?.();
            setGithubUser(github || null);
        }
    };

    const loadFromDirectory = async (dir: string) => {
        setWorkspacePath(dir);
        if (typeof window !== 'undefined' && window.electronAPI) {
            try {
                const files = await window.electronAPI.loadWorkspace(dir);
                setProject(prev => {
                    const newState = { ...prev };
                    const mapDirToKey: Record<string, keyof ProjectState> = {
                        'competencies': 'competencies',
                        'concepts': 'concepts',
                        'skills': 'skills',
                        'tools': 'tools',
                        'meta-skills': 'metaSkills'
                    };

                    Object.entries(files).forEach(([dirName, contentMap]) => {
                        let key = mapDirToKey[dirName];
                        if (!key && dirName.endsWith('s')) {
                            // potential fallback
                        }

                        if (key) {
                            const current = newState[key];
                            if (current && typeof current === 'object' && !Array.isArray(current)) {
                                (newState[key] as Record<string, string>) = { ...current, ...contentMap };
                            }
                        }
                    });
                    return newState;
                });
            } catch (error) {
                console.error('Failed to load workspace files:', error);
            }
        }
    };

    useEffect(() => {
        refreshAuthStatus();
        if (typeof window !== 'undefined' && window.electronAPI?.getWorkspacePath) {
            window.electronAPI.getWorkspacePath().then((dir) => {
                if (dir && typeof dir === 'string') {
                    loadFromDirectory(dir);
                }
            });
        }
    }, []);

    const openWorkspace = async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            try {
                const dir = await window.electronAPI.openDirectory();
                if (dir) {
                    await loadFromDirectory(dir);
                }
            } catch (error) {
                console.error('Failed to open workspace:', error);
            }
        }
    };

    const saveEntityToWorkspace = async (type: string, id: string, content: string) => {
        if (typeof window !== 'undefined' && window.electronAPI && workspacePath) {
            try {
                // Ensure proper folder mapping? 
                // type 'skill' -> 'skills' usually.
                return await window.electronAPI.saveFile({ dirPath: workspacePath, type, id, content });
            } catch (error) {
                console.error('Failed to save entity:', error);
                return false;
            }
        }
        return false;
    };

    const syncRemoteRepos = async () => {
        const enabledRepos = project.remoteRepositories.filter(r => r.enabled);
        if (enabledRepos.length === 0) {
            setRemoteEntities([]);
            return;
        }
        setIsSyncing(true);
        try {
            const allRemote: RemoteEntity[] = [];
            for (const repo of enabledRepos) {
                const entities = await remoteService.fetchRegistry(repo.url);
                allRemote.push(...entities);
            }
            setRemoteEntities(allRemote);
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        syncRemoteRepos();
    }, [project.remoteRepositories.map(r => r.url + r.enabled).join(',')]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    // Helper for functional updates to deep state
    const updateProject = (updater: (prev: ProjectState) => ProjectState) => {
        setProject((prev) => {
            const next = updater(prev);
            // TODO: Auto-save logic if needed?
            return next;
        });
    };

    const toggleRemoteRepo = (url: string) => {
        updateProject(prev => ({
            ...prev,
            remoteRepositories: prev.remoteRepositories.map(r =>
                r.url === url ? { ...r, enabled: !r.enabled } : r
            )
        }));
    };

    const removeRemoteRepo = (url: string) => {
        updateProject(prev => ({
            ...prev,
            remoteRepositories: prev.remoteRepositories.filter(r => r.url !== url)
        }));
    };

    return (
        <WizardContext.Provider value={{
            activeStep,
            setActiveStep,
            project,
            handleNext,
            handleBack,
            updateProject,
            setProject,
            remoteEntities,
            isSyncing,
            syncRemoteRepos,
            toggleRemoteRepo,
            removeRemoteRepo,
            workspacePath,
            openWorkspace,
            saveEntityToWorkspace,
            isSettingsOpen,
            settingsTab,
            toggleSettings: (open: boolean, tabIndex?: number) => {
                setIsSettingsOpen(open);
                if (tabIndex !== undefined) setSettingsTab(tabIndex);
            },
            driveUser,
            githubUser,
            refreshAuthStatus,
            cloneRemoteEntity: async (entity) => {
                try {
                    const content = await remoteService.fetchEntityContent(entity.rawUrl);
                    if (!content) return false;

                    updateProject(prev => {
                        const collection = `${entity.type}s` as keyof ProjectState;
                        const currentCollection = prev[collection] as Record<string, string>;

                        // Handle ID collision by adding _cloned suffix if needed
                        let targetId = entity.id;
                        if (currentCollection[targetId]) {
                            targetId = `${entity.id}_cloned_${Date.now().toString().slice(-4)}`;
                        }

                        return {
                            ...prev,
                            [collection]: {
                                ...currentCollection,
                                [targetId]: content
                            }
                        };
                    });
                    return true;
                } catch (error) {
                    console.error('Cloning failed:', error);
                    return false;
                }
            }
        }}>
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (!context) throw new Error('useWizard must be used within a WizardProvider');
    return context;
}
