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
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [activeStep, setActiveStep] = useState(0);
    const [project, setProject] = useState<ProjectState>(INITIAL_PROJECT_STATE);
    const [remoteEntities, setRemoteEntities] = useState<RemoteEntity[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const remoteService = useMemo(() => new RemoteRepositoryService(), []);

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
        setProject((prev) => updater(prev));
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
