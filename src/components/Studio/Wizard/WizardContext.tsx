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
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [activeStep, setActiveStep] = useState(0);
    const [project, setProject] = useState<ProjectState>(INITIAL_PROJECT_STATE);
    const [remoteEntities, setRemoteEntities] = useState<RemoteEntity[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const remoteService = useMemo(() => new RemoteRepositoryService(), []);

    const syncRemoteRepos = async () => {
        if (project.remoteRepositories.length === 0) {
            setRemoteEntities([]);
            return;
        }
        setIsSyncing(true);
        try {
            const allRemote: RemoteEntity[] = [];
            for (const repoUrl of project.remoteRepositories) {
                const entities = await remoteService.fetchRegistry(repoUrl);
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
    }, [project.remoteRepositories]);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    // Helper for functional updates to deep state
    const updateProject = (updater: (prev: ProjectState) => ProjectState) => {
        setProject((prev) => updater(prev));
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
            syncRemoteRepos
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
