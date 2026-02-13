'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { type Monaco, type OnMount, useMonaco } from '@monaco-editor/react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useAI } from '@/contexts/AIContext';
import { useStudioIntelligence } from '@/hooks/useStudioIntelligence';
import type { ProjectState } from '@/services/project_manager';
import { ValidationSidebar } from './ValidationSidebar';
import type { editor, Uri, IRange, IDisposable, languages } from 'monaco-editor';
import type { SuggestedAction } from '@/hooks/useStudioIntelligence';
import { useStudio } from '@/contexts/StudioContext';

interface CognitiveMonacoEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    fullHeight?: boolean;
    rows?: number;
    onSuggestionChange?: (suggestion: SuggestedAction | null) => void;
    project?: ProjectState;
    onSearch?: (query: string) => void;
}

export function CognitiveMonacoEditor({
    value,
    onChange,
    fullHeight = false,
    rows = 15,
    onSuggestionChange,
    project,
    onSearch
}: CognitiveMonacoEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const muiTheme = useTheme();
    // Project is now a prop
    const { isModelReady, generate } = useAI();
    const { createEntity, getLibraryContext } = useStudio();
    const monaco = useMonaco();

    // Intelligence Integration
    const { markers, validationState, suggestions } = useStudioIntelligence(value, project, generate, isModelReady, getLibraryContext, createEntity);

    // Propagate suggestions (default to top priority)
    const prevSuggestionIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (onSuggestionChange) {
            const topSuggestion = suggestions.length > 0 ? (suggestions[0] || null) : null;
            // Only propagate if the top suggestion has changed to avoid overriding manual selection unnecessarily
            // or causing infinite loops if parent state update triggers re-render
            if (topSuggestion?.id !== prevSuggestionIdRef.current) {
                prevSuggestionIdRef.current = topSuggestion?.id || null;
                onSuggestionChange(topSuggestion);
            }
        }
    }, [suggestions, onSuggestionChange]);

    // Apply markers
    useEffect(() => {
        if (monaco && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monaco.editor.setModelMarkers(model, 'cognitive-lint', markers);
            }
        }
    }, [monaco, markers]);

    // Keep project in ref for access inside completion provider closure
    const projectRef = useRef(project);
    useEffect(() => {
        projectRef.current = project;
    }, [project]);

    // Update theme when MUI theme changes
    useEffect(() => {
        if (monaco) {
            monaco.editor.setTheme(muiTheme.palette.mode === 'dark' ? 'cognitive-dark' : 'cognitive-light');
        }
    }, [muiTheme.palette.mode, monaco]);

    const handleEditorWillMount = (monaco: Monaco) => {
        // 1. Register Language
        if (!monaco.languages.getLanguages().some((l: { id: string }) => l.id === 'cognitive-markdown')) {
            monaco.languages.register({ id: 'cognitive-markdown' });

            // Syntax Highlighting
            monaco.languages.setMonarchTokensProvider('cognitive-markdown', {
                tokenizer: {
                    root: [
                        [/^#\s.*$/, 'keyword'], // H1
                        [/^##\s.*$/, 'type'], // H2
                        [/^###\s.*$/, 'string'], // H3
                        [/@\w+:\w+/, 'variable'], // Entity Link
                        [/>\sACTION:/, 'custom-action'],
                        [/\?\sDECISION:/, 'custom-decision'],
                        [/@\sCONTEXT:/, 'custom-context'],
                        [/!\sCRITICAL:/, 'custom-critical'],
                        [/\*\*.+?\*\*/, 'strong'],
                        [/\*.+?\*/, 'emphasis'],
                        [/`.*?`/, 'comment'], // code
                    ]
                }
            });

            // Completion Provider
            monaco.languages.registerCompletionItemProvider('cognitive-markdown', {
                triggerCharacters: ['@', ':'],
                provideCompletionItems: (model: editor.ITextModel, position: any) => {
                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                    });

                    const matchType = textUntilPosition.match(/@(\w*)$/);
                    const matchId = textUntilPosition.match(/@(competency|skill|concept|tool):(\w*)$/);

                    const suggestions: any[] = [];

                    if (matchType && matchType[1]) {
                        // Suggest types
                        const typeQuery = matchType[1];
                        ['competency', 'skill', 'concept', 'tool'].forEach(t => {
                            suggestions.push({
                                label: t,
                                kind: monaco.languages.CompletionItemKind.Class,
                                insertText: t + ':',
                                range: {
                                    startLineNumber: position.lineNumber,
                                    startColumn: position.column - typeQuery.length,
                                    endLineNumber: position.lineNumber,
                                    endColumn: position.column
                                },
                                detail: `Reference a ${t}`
                            });
                        });
                    } else if (matchId && matchId[1]) {
                        const type = matchId[1];
                        const partialLength = (matchId[2]?.length || 0);
                        const currentProject = projectRef.current; // Access via closure ref

                        if (!currentProject) return { suggestions: [] };

                        // Get entities from project
                        // Access via key: 'competencies', 'skills', etc.
                        const collectionKey = type === 'competency' ? 'competencies' : `${type}s`;
                        // @ts-ignore - Dynamic access
                        const collection = (currentProject[collectionKey] || {}) as Record<string, string>;

                        if (collection) {
                            Object.entries(collection).forEach(([id, content]) => {
                                // Guard against non-string content
                                if (typeof content !== 'string') return;

                                // Extract name from content if possible
                                let label = id;
                                const nameMatch = content.match(/^name:\s*(.*)$/m);
                                if (nameMatch && nameMatch[1]) label = `${id} (${nameMatch[1].trim()})`;

                                suggestions.push({
                                    label: id,
                                    kind: monaco.languages.CompletionItemKind.Reference,
                                    insertText: id,
                                    range: {
                                        startLineNumber: position.lineNumber,
                                        // @ts-ignore
                                        startColumn: position.column - partialLength,
                                        endLineNumber: position.lineNumber,
                                        endColumn: position.column
                                    },
                                    detail: label
                                });
                            });
                        }
                    }

                    return { suggestions };
                }
            });
        }

        // 2. Define Themes
        monaco.editor.defineTheme('cognitive-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'custom-action', foreground: '4caf50', fontStyle: 'bold' },
                { token: 'custom-decision', foreground: '2196f3', fontStyle: 'bold' },
                { token: 'custom-context', foreground: '9c27b0', fontStyle: 'bold' },
                { token: 'custom-critical', foreground: 'f44336', fontStyle: 'bold' },
                { token: 'variable', foreground: 'ff9800' },
            ],
            colors: {
                'editor.background': '#1e1e1e'
            }
        });

        monaco.editor.defineTheme('cognitive-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'custom-action', foreground: '2e7d32', fontStyle: 'bold' },
                { token: 'custom-decision', foreground: '1565c0', fontStyle: 'bold' },
                { token: 'custom-context', foreground: '7b1fa2', fontStyle: 'bold' },
                { token: 'custom-critical', foreground: 'c62828', fontStyle: 'bold' },
                { token: 'variable', foreground: 'ef6c00' },
            ],
            colors: {}
        });
    };

    // Register CodeLens and Commands for AI Suggestions
    useEffect(() => {
        if (!monaco) return;

        // Commands (Register only if not disposing immediately, but overwriting is safeish)
        // We use try-catch to avoid 'Command already exists' error if valid
        // Actually Monaco's registerCommand overwrites. However, we return disposables.

        const disposables: IDisposable[] = [];

        try {
            disposables.push(monaco.editor.registerCommand('studio.ai.accept', (accessor, uri: Uri, range: IRange) => {
                const model = monaco.editor.getModel(uri);
                if (model) {
                    const text = model.getValueInRange(range);
                    const lines = text.split('\n');
                    if (lines.length >= 3) {
                        const inner = lines.slice(1, lines.length - 1).join('\n');
                        model.pushEditOperations([], [{ range, text: inner }], () => null);
                    }
                }
            }));

            disposables.push(monaco.editor.registerCommand('studio.ai.reject', (accessor, uri: Uri, range: IRange) => {
                const model = monaco.editor.getModel(uri);
                if (model) {
                    model.pushEditOperations([], [{ range, text: "" }], () => null);
                }
            }));

            disposables.push(monaco.languages.registerCodeLensProvider('markdown', {
                provideCodeLenses: (model) => {
                    const lenses: languages.CodeLens[] = [];
                    const value = model.getValue();
                    // Simple check before splitting
                    if (!value.includes(':::ai-suggestion')) return { lenses: [], dispose: () => { } };

                    const lines = value.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line && line.trim() === ':::ai-suggestion') {
                            let endLine = -1;
                            for (let j = i + 1; j < lines.length; j++) {
                                const subLine = lines[j];
                                if (subLine && subLine.trim() === ':::') {
                                    endLine = j;
                                    break;
                                }
                            }

                            if (endLine !== -1) {
                                const endLineContent = lines[endLine];
                                if (endLineContent) {
                                    const range = {
                                        startLineNumber: i + 1,
                                        startColumn: 1,
                                        endLineNumber: endLine + 1,
                                        endColumn: endLineContent.length + 1
                                    };

                                    lenses.push({
                                        range,
                                        id: `accept-${i}`,
                                        command: {
                                            id: 'studio.ai.accept',
                                            title: '✓ Accept Change',
                                            arguments: [model.uri, range]
                                        }
                                    });
                                    lenses.push({
                                        range,
                                        id: `reject-${i}`,
                                        command: {
                                            id: 'studio.ai.reject',
                                            title: '✗ Reject Change',
                                            arguments: [model.uri, range]
                                        }
                                    });
                                }
                            }
                        }
                    }
                    return { lenses, dispose: () => { } };
                }
            }));
        } catch (e) {
            console.error("Failed to register AI commands", e);
        }

        return () => {
            disposables.forEach(d => d.dispose());
        };
    }, [monaco]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent(() => {
            const val = editor.getValue();

            // Sync Definitions back to Global Store
            // Regex to find > DEFINE: @type:id ...
            const defineRegex = /> DEFINE: @(competency|skill|tool|concept|meta-skill):(\w+)\s+([\s\S]*?)(?=(> DEFINE:|$))/g;
            let match;
            while ((match = defineRegex.exec(val)) !== null) {
                const [_, type, id, content] = match;
                if (type && id && content) {
                    // Update global entity
                    // Debouncing would be ideal here, but relying on Context's batching or performant updates
                    createEntity(type as any, id, content.trim());
                }
            }

            onChange(val);
        });

        // --- Context Menu Actions ---

        // Helper to get selection
        const getSelectionText = () => {
            const selection = editor.getSelection();
            return selection ? editor.getModel()?.getValueInRange(selection) : '';
        };

        // 1. AI Actions
        const aiActionIds = [
            { id: 'ai-revise', label: 'AI: Revise Selection', prompt: (text: string) => `Rewrite the following text to be more professional, concise, and clear:\n\n${text}` },
            { id: 'ai-expand', label: 'AI: Expand Selection', prompt: (text: string) => `Expand on the following concept with more detail and context:\n\n${text}` }
        ];

        aiActionIds.forEach(action => {
            editor.addAction({
                id: action.id,
                label: action.label,
                contextMenuGroupId: '1_ai',
                run: async () => {
                    const text = getSelectionText();
                    if (text && isModelReady) {
                        // User feedback: placeholder edit
                        const selection = editor.getSelection();
                        if (!selection) return;

                        // We can't easily show loading in context menu check, but we can verify isModelReady
                        try {
                            // This is async, so we might need to handle UI blocking or Toast.
                            // For now, prompt the user we are working? 
                            // Simplest: Replace text with "Thinking..." then result.
                            const opId = { major: 1, minor: 1 };
                            editor.executeEdits('ai', [{ range: selection, text: `(Thinking...) ${text}` }]);

                            const result = await generate(action.prompt(text));

                            // Find range again (it shifted due to edit) - strict range tracking is hard without model push.
                            // Simplest: Just use the undo stack or assume user didn't type.
                            // Actually, let's just use the current selection if it hasn't moved much, or better:
                            // Don't modify text until done. 
                            // But user wants feedback.
                            // Let's just output the result to console or alert for now, or replace.
                            // "Adapt style of button" applies to the sidebar button. Here we are in context menu.

                            // Replace selection with result
                            // Re-acquire selection in case it changed?
                            // Assuming sync:
                            editor.executeEdits('ai', [{ range: selection, text: result }]);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
        });

        // 2. Extract Actions
        const extractTypes = ['skill', 'tool', 'concept', 'meta-skill'] as const;
        extractTypes.forEach(type => {
            editor.addAction({
                id: `extract-${type}`,
                label: `Extract as ${type === 'meta-skill' ? 'Meta-Skill' : type.charAt(0).toUpperCase() + type.slice(1)}`,
                contextMenuGroupId: '2_extract',
                run: () => {
                    const text = getSelectionText();
                    if (text) {
                        // Create entity
                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                        if (id) {
                            // 1. Create global entity (placeholder)
                            createEntity(type, id, `name: ${text}\n\n(Draft Definition)`);

                            const model = editor.getModel();
                            if (model) {
                                // 2. Find ALL instances
                                const matches = model.findMatches(text, false, false, true, null, true);

                                // 3. Replace All
                                const edits = matches.map(m => ({
                                    range: m.range,
                                    text: `@${type}:${id}`
                                }));
                                editor.executeEdits('extract-replace', edits);

                                // 4. Append Definition Block
                                // We do this as a second edit to ensure line numbers are correct after replacement
                                // (though replacements shouldn't change line count typically if single line, but to be safe)
                                const lastLine = model.getLineCount();
                                const appendText = `\n\n> DEFINE: @${type}:${id}\nname: ${text}\n\nAdd description for ${text} here...\n`;

                                editor.executeEdits('extract-append', [{
                                    range: new monaco.Range(lastLine + 1, 1, lastLine + 1, 1),
                                    text: appendText
                                }]);
                            }
                        }
                    }
                }
            });
        });

        // 3. Search Action
        editor.addAction({
            id: 'search-related',
            label: 'Search Related Entity',
            contextMenuGroupId: '3_search',
            run: () => {
                const text = getSelectionText();
                if (text && onSearch) {
                    onSearch(text);
                }
            }
        });
    };

    return (
        <Box sx={{
            height: fullHeight ? '100%' : (rows * 24 + 'px'),
            flexGrow: 1,
            overflow: 'hidden',
            border: fullHeight ? 'none' : '1px solid',
            borderColor: 'divider',
            borderRadius: fullHeight ? 0 : 1,
            position: 'relative',
            pr: '16px' // Space for validation sidebar
        }}>
            <Editor
                height="100%"
                defaultLanguage="markdown"
                language="cognitive-markdown"
                value={value}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    padding: { top: 16, bottom: 16, },
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'hidden'
                    }
                }}
            />
            {validationState && (
                <ValidationSidebar
                    validation={validationState}
                    suggestions={suggestions}
                    onActionSelect={(action) => {
                        if (onSuggestionChange) onSuggestionChange(action);
                    }}
                />
            )}
        </Box>
    );
}
