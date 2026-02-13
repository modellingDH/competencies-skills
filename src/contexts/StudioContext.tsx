import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { ProjectState } from '@/services/project_manager';
import { SYSTEM_ENTITIES, DEFAULT_SYSTEM_SKILL_STATES } from '@/lib/system-skills';

export enum StudioView {
    Dashboard = 'dashboard',
    Editor = 'editor',
}

interface StudioContextType {
    currentView: StudioView;
    activeEntity: { type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill'; id: string } | null;
    project: ProjectState;
    updateProject: (updater: (prev: ProjectState) => ProjectState) => void;
    // Navigation
    openCompetency: (id: string) => void;
    createCompetency: (id: string, content: string) => void;
    createEntity: (type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill', id: string, content: string) => void;
    deleteEntity: (type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill', id: string) => void;
    deleteCompetency: (id: string) => void;
    backToDashboard: () => void;
    // RAG
    getLibraryContext: () => string;
    // System skills
    toggleSystemSkill: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function useStudio() {
    const context = useContext(StudioContext);
    if (!context) throw new Error('useStudio must be used within a StudioProvider');
    return context;
}

export function StudioProvider({ children }: { children: ReactNode }) {
    const [currentView, setCurrentView] = useState<StudioView>(StudioView.Dashboard);
    const [activeEntity, setActiveEntity] = useState<{ type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill'; id: string } | null>(null);

    const [project, setProject] = useState<ProjectState>({
        name: 'My Studio Project',
        metaSkills: {},
        competencies: {},
        skills: {},
        tools: {},
        concepts: {},
        remoteRepositories: [],
        enabledSystemSkills: { ...DEFAULT_SYSTEM_SKILL_STATES }
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('studio_project_state');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Ensure we merge with defaults so structural keys are rarely missing
                    setProject(prev => ({
                        ...prev,
                        ...parsed
                    }));
                } catch (e) {
                    console.error("Failed to recover project state", e);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Persistence
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('studio_project_state', JSON.stringify(project));
        }
    }, [project, isLoaded]);

    // Load from Electron Workspace
    useEffect(() => {
        if (typeof window !== 'undefined' && window.electronAPI?.getWorkspacePath) {
            window.electronAPI.getWorkspacePath().then((dir) => {
                if (dir && typeof dir === 'string') {
                    // Logic to load workspace
                    loadFromDirectory(dir);
                }
            }).catch(e => {
                console.error("Failed to get workspace path", e);
            });
        }
    }, []);

    const loadFromDirectory = async (dir: string) => {
        if (typeof window !== 'undefined' && window.electronAPI?.loadWorkspace) {
            try {
                const rawFiles = await window.electronAPI.loadWorkspace(dir);
                if (!rawFiles || typeof rawFiles !== 'object') {
                    console.warn("loadWorkspace returned invalid result:", rawFiles);
                    return;
                }
                const files = rawFiles as Record<string, Record<string, string>>;

                setProject(prev => {
                    const newState = { ...prev };
                    const mapDirToKey: Record<string, keyof ProjectState> = {
                        'competencies': 'competencies',
                        'concepts': 'concepts',
                        'skills': 'skills',
                        'tools': 'tools',
                        'meta-skills': 'metaSkills'
                    };

                    // Reset all mapped collections before loading from disk
                    Object.values(mapDirToKey).forEach(key => {
                        if (typeof newState[key] === 'object' && !Array.isArray(newState[key])) {
                            (newState[key] as Record<string, string>) = {};
                        }
                    });

                    Object.entries(files).forEach(([dirName, contentMap]) => {
                        const key = mapDirToKey[dirName];
                        if (key && contentMap && typeof contentMap === 'object') {
                            (newState[key] as Record<string, string>) = { ...contentMap };
                        }
                    });
                    return newState;
                });
            } catch (error) {
                console.error('Failed to load workspace files:', error);
            }
        }
    };

    const updateProject = (updater: (prev: ProjectState) => ProjectState) => {
        setProject(prev => updater(prev));
    };

    const openCompetency = (id: string) => {
        setActiveEntity({ type: 'competency', id });
        setCurrentView(StudioView.Editor);
    };

    const createCompetency = (id: string, content: string) => {
        updateProject(prev => ({
            ...prev,
            competencies: {
                ...(prev.competencies || {}),
                [id]: content
            }
        }));
    };

    const createEntity = (type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill', id: string, content: string) => {
        updateProject(prev => {
            let collectionKey: keyof ProjectState;
            if (type === 'competency') collectionKey = 'competencies';
            else if (type === 'meta-skill') collectionKey = 'metaSkills';
            else collectionKey = `${type}s` as keyof ProjectState;

            const currentCollection = (prev[collectionKey] || {}) as Record<string, string>;
            return {
                ...prev,
                [collectionKey]: {
                    ...currentCollection,
                    [id]: content
                }
            };
        });
    };

    const deleteCompetency = (id: string) => {
        updateProject(prev => {
            const next = { ...prev.competencies };
            delete next[id];
            return { ...prev, competencies: next };
        });
    };

    const deleteEntity = (type: 'competency' | 'skill' | 'tool' | 'concept' | 'meta-skill', id: string) => {
        updateProject(prev => {
            let collectionKey: keyof ProjectState;
            if (type === 'competency') collectionKey = 'competencies';
            else if (type === 'meta-skill') collectionKey = 'metaSkills';
            else collectionKey = `${type}s` as keyof ProjectState;

            const currentCollection = (prev[collectionKey] || {}) as Record<string, string>;
            const nextCollection = { ...currentCollection };
            delete nextCollection[id];

            return {
                ...prev,
                [collectionKey]: nextCollection
            };
        });
    };

    const backToDashboard = () => {
        setActiveEntity(null);
        setCurrentView(StudioView.Dashboard);
    };

    const extractDescription = (content: string) => {
        const role = content.match(/##\s+ROLE[\s\S]*?\n([^#]+)/);
        if (role?.[1]) return role[1].trim().substring(0, 100).replace(/\n/g, ' ') + "...";
        const obj = content.match(/##\s+OBJECTIVE[\s\S]*?\n([^#]+)/);
        if (obj?.[1]) return obj[1].trim().substring(0, 100).replace(/\n/g, ' ') + "...";
        return "No description.";
    };

    const getLibraryContext = () => {
        let ctx = "Library Context:\n\n";

        // System entities (full content for enabled ones)
        const systemStates = project.enabledSystemSkills || {};
        const enabledSystem = SYSTEM_ENTITIES.filter(
            e => systemStates[e.id] !== false
        );
        if (enabledSystem.length > 0) {
            ctx += "=== SYSTEM SKILLS (Gemma's built-in knowledge) ===\n\n";
            for (const entity of enabledSystem) {
                ctx += `--- ${entity.type}: ${entity.id} ---\n`;
                ctx += entity.content + "\n\n";
            }
            ctx += "=== END SYSTEM SKILLS ===\n\n";
        }

        // User entities (descriptions only)
        if (project.metaSkills && Object.keys(project.metaSkills).length > 0) {
            ctx += "User Meta-Skills:\n";
            Object.entries(project.metaSkills).forEach(([id, content]) => {
                ctx += `- meta-skill/${id}: ${extractDescription(content as string)}\n`;
            });
            ctx += "\n";
        }

        if (project.competencies && Object.keys(project.competencies).length > 0) {
            ctx += "User Skills (Primary):\n";
            Object.entries(project.competencies).forEach(([id, content]) => {
                ctx += `- competency/${id}: ${extractDescription(content as string)}\n`;
            });
            ctx += "\n";
        }

        if (project.skills && Object.keys(project.skills).length > 0) {
            ctx += "User Skills:\n";
            Object.entries(project.skills).forEach(([id, content]) => {
                ctx += `- skill/${id}: ${extractDescription(content as string)}\n`;
            });
            ctx += "\n";
        }

        if (project.concepts && Object.keys(project.concepts).length > 0) {
            ctx += "User Concepts:\n";
            Object.entries(project.concepts).forEach(([id, content]) => {
                ctx += `- concept/${id}: ${extractDescription(content as string)}\n`;
            });
            ctx += "\n";
        }

        if (project.tools && Object.keys(project.tools).length > 0) {
            ctx += "User Tools:\n";
            Object.entries(project.tools).forEach(([id, content]) => {
                ctx += `- tool/${id}: ${extractDescription(content as string)}\n`;
            });
            ctx += "\n";
        }

        return ctx;
    };

    const toggleSystemSkill = (id: string) => {
        setProject(prev => ({
            ...prev,
            enabledSystemSkills: {
                ...(prev.enabledSystemSkills || {}),
                [id]: !(prev.enabledSystemSkills?.[id] ?? true)
            }
        }));
    };

    const value = useMemo(() => ({
        currentView,
        activeEntity,
        project,
        updateProject,
        openCompetency,
        createCompetency,
        createEntity,
        deleteCompetency,
        deleteEntity,
        backToDashboard,
        getLibraryContext,
        toggleSystemSkill,
    }), [currentView, activeEntity, project]);

    return (
        <StudioContext.Provider value={value}>
            {children}
        </StudioContext.Provider>
    );
}
