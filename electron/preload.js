const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    getWorkspacePath: () => ipcRenderer.invoke('workspace:getPath'),
    loadWorkspace: (path) => ipcRenderer.invoke('workspace:load', path),
    saveFile: (data) => ipcRenderer.invoke('workspace:saveFile', data),

    // Google Drive
    authenticateGoogleDrive: () => ipcRenderer.invoke('drive:auth'),
    getDriveUser: () => ipcRenderer.invoke('drive:getUser'),
    logoutGoogleDrive: () => ipcRenderer.invoke('drive:logout'),
    listDriveFiles: () => ipcRenderer.invoke('drive:list'),
    saveToDrive: (data) => ipcRenderer.invoke('drive:save', data),

    // GitHub
    authenticateGitHub: () => ipcRenderer.invoke('github:auth'),
    getGitHubUser: () => ipcRenderer.invoke('github:getUser'),
    logoutGitHub: () => ipcRenderer.invoke('github:logout'),
    createGitHubGist: (data) => ipcRenderer.invoke('github:createGist', data),
    updateGitHubGist: (data) => ipcRenderer.invoke('github:updateGist', data),
});
