const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
require('dotenv').config();
const { google } = require('googleapis');
const url = require('url');

let store;

(async () => {
    const { default: Store } = await import('electron-store');
    store = new Store();
})();

let mainWindow;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
    } else {
        // In production, load the built Next.js export
        win.loadFile(path.join(__dirname, '../out/index.html'));
    }
    mainWindow = win;
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC: Open Directory Dialog
ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    });
    if (canceled) {
        return null;
    } else {
        const dir = filePaths[0];
        if (store) store.set('workspacePath', dir); // Save preference
        return dir;
    }
});

// IPC: Get Current Workspace Path
ipcMain.handle('workspace:getPath', () => {
    return store ? store.get('workspacePath', null) : null;
});

// IPC: Read Directory Contents
ipcMain.handle('workspace:load', async (event, dirPath) => {
    if (!dirPath) return {};

    const loadFiles = (dir, baseDir) => {
        let results = {};
        if (!fs.existsSync(dir)) return results;

        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                Object.assign(results, loadFiles(filePath, baseDir));
            } else {
                if (file.endsWith('.md')) {
                    const id = file.replace('.md', '');
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const parentDir = path.basename(dir);
                    if (!results[parentDir]) results[parentDir] = {};
                    results[parentDir][id] = content;
                }
            }
        });
        return results;
    };

    return loadFiles(dirPath, dirPath);
});

ipcMain.handle('workspace:saveFile', async (event, { dirPath, type, id, content }) => {
    if (!dirPath) return false;
    const typeDir = path.join(dirPath, type.endsWith('y') && !type.endsWith('ay') && !type.endsWith('ey') && !type.endsWith('oy') && !type.endsWith('uy') ? type.slice(0, -1) + 'ies' : type + (type.endsWith('s') ? '' : 's'));
    if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
    }
    const filePath = path.join(typeDir, `${id}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
});


// --- Google Drive Integration ---

// NOTE: These tokens should be protected or injected via ENV in build.
// For open source demo, we rely on user providing them or using a public proxy.
// However, Electron runs locally, so public Client ID is acceptable if PKCE is used.
// But googleapis requires Client Secret for web flow emulation.
// We will look for ENV vars.

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = 'http://localhost/callback'; // Loopback

function getOauth2Client() {
    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
}

ipcMain.handle('drive:getUser', async () => {
    if (!store) return null;
    const tokens = store.get('googleTokens');
    if (!tokens) return null;

    const oAuth2Client = getOauth2Client();
    oAuth2Client.setCredentials(tokens);
    try {
        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
        const user = await oauth2.userinfo.get();
        return user.data.email;
    } catch (e) {
        return null; // Token expired or invalid
    }
});

ipcMain.handle('drive:auth', async () => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error("Missing Google Client ID/Secret");
        return false;
    }

    const oAuth2Client = getOauth2Client();

    // Check if we have stored tokens
    const tokens = store ? store.get('googleTokens') : null;

    if (tokens) {
        oAuth2Client.setCredentials(tokens);
        // Verify validity?
        // Let's optimistic return email
        // But better to verify.
        try {
            const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
            const user = await oauth2.userinfo.get();
            return user.data.email;
        } catch (e) {
            console.log("Stored token invalid or expired", e);
            // Fall through to re-auth
        }
    }

    // Start Auth Flow
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'],
    });

    return new Promise((resolve, reject) => {
        let isResolved = false;
        const authWindow = new BrowserWindow({
            width: 500,
            height: 600,
            show: true,
            parent: mainWindow,
            modal: false,
            webPreferences: {
                nodeIntegration: false
            }
        });

        const closeAuth = () => {
            if (!authWindow.isDestroyed()) {
                authWindow.close();
            }
        };

        // If user clicks back on main window, close auth
        const onMainFocus = () => {
            closeAuth();
        };
        mainWindow.on('focus', onMainFocus);

        authWindow.loadURL(authUrl);

        authWindow.webContents.on('will-redirect', async (event, newUrl) => {
            if (newUrl.startsWith(REDIRECT_URI)) {
                event.preventDefault(); // Stop navigation to localhost
                // Parse code
                const urlParts = url.parse(newUrl, true);
                const code = urlParts.query.code;

                if (code) {
                    try {
                        const { tokens } = await oAuth2Client.getToken(code);
                        oAuth2Client.setCredentials(tokens);
                        if (store) store.set('googleTokens', tokens);

                        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
                        const user = await oauth2.userinfo.get();

                        isResolved = true;
                        resolve(user.data.email);
                        closeAuth();
                    } catch (e) {
                        console.error('Error retrieving access token', e);
                        isResolved = true;
                        resolve(false);
                        closeAuth();
                    }
                }
            }
        });

        authWindow.on('closed', () => {
            mainWindow.removeListener('focus', onMainFocus);
            if (!isResolved) resolve(false);
        });
    });
});

ipcMain.handle('drive:logout', async () => {
    if (store) store.delete('googleTokens');
});

ipcMain.handle('drive:list', async () => {
    if (!store) return [];
    const tokens = store.get('googleTokens');
    if (!tokens) return [];

    const oAuth2Client = getOauth2Client();
    oAuth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    try {
        const res = await drive.files.list({
            pageSize: 50,
            fields: 'nextPageToken, files(id, name, mimeType)',
            q: "name contains '.md' and trashed = false" // Simple filter
        });
        return res.data.files || [];
    } catch (e) {
        console.error('Drive List Error', e);
        return [];
    }
});

// Helper to find or create a folder in Drive
async function ensureDriveFolder(drive, name, parentId = 'root') {
    try {
        const q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`;
        const res = await drive.files.list({ q, spaces: 'drive', fields: 'files(id, name)' });
        if (res.data.files.length > 0) {
            return res.data.files[0].id;
        }
        // Create
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        };
        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        return file.data.id;
    } catch (e) {
        console.error(`Error ensuring drive folder ${name}:`, e);
        return null;
    }
}

// Helper to save/update file in Drive
async function saveToDriveFolder(drive, folderId, fileName, content) {
    try {
        const q = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
        const res = await drive.files.list({ q, spaces: 'drive', fields: 'files(id, name)' });

        const media = {
            mimeType: 'text/markdown',
            body: content
        };

        if (res.data.files.length > 0) {
            // Update
            const fileId = res.data.files[0].id;
            await drive.files.update({
                fileId: fileId,
                media: media
            });
            return fileId; // Return ID
        } else {
            // Create
            const fileMetadata = {
                name: fileName,
                parents: [folderId]
            };
            await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });
            return 'new';
        }
    } catch (e) {
        console.error(`Error saving file ${fileName} to drive:`, e);
        return null;
    }
}

ipcMain.handle('drive:save', async (event, { type, id, content }) => {
    if (!store) return false;
    const tokens = store.get('googleTokens');
    if (!tokens) return false;

    const oAuth2Client = getOauth2Client();
    oAuth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    try {
        // 1. Ensure Root Folder "Cognitive Library"
        const rootId = await ensureDriveFolder(drive, 'Cognitive Library');
        if (!rootId) throw new Error("Could not access/create root folder");

        // 2. Determine Subfolder
        // Pluralize logic matching filesystem: competency->competencies, skill->skills
        const typeFolder = type.endsWith('y') ? type.slice(0, -1) + 'ies' : type + 's';
        const typeId = await ensureDriveFolder(drive, typeFolder, rootId);

        if (typeId) {
            await saveToDriveFolder(drive, typeId, `${id}.md`, content);
        }

        // 3. SPECIAL: Copy to 'meta-skills' if requested or implied by user
        // User request: "make a copy to the metaskills as well"
        // We will assume this applies to 'skill' type primarily, but let's do it for 'skill' specifically?
        // Or if the user meant 'meta-skills' folder.
        if (type === 'skill') {
            const metaId = await ensureDriveFolder(drive, 'meta-skills', rootId);
            if (metaId) {
                await saveToDriveFolder(drive, metaId, `${id}.md`, content);
            }
        }

        return true;
    } catch (e) {
        console.error('Drive Save Error', e);
        return false;
    }
});

// --- GitHub Integration ---

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

ipcMain.handle('github:getUser', async () => {
    if (!store) return null;
    const token = store.get('githubToken');
    if (!token) return null;

    try {
        const { Octokit } = await import('octokit');
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.rest.users.getAuthenticated();
        return data.login;
    } catch (e) {
        return null;
    }
});

ipcMain.handle('github:auth', async () => {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        console.error("Missing GitHub Client ID/Secret");
        return false;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=gist`;

    return new Promise((resolve, reject) => {
        let isResolved = false;
        const authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: true,
            parent: mainWindow,
            modal: false,
            webPreferences: {
                nodeIntegration: false
            }
        });

        const closeAuth = () => {
            if (!authWindow.isDestroyed()) {
                authWindow.close();
            }
        };

        const onMainFocus = () => {
            closeAuth();
        };
        mainWindow.on('focus', onMainFocus);

        authWindow.loadURL(authUrl);

        authWindow.webContents.on('will-redirect', async (event, newUrl) => {
            const urlParts = url.parse(newUrl, true);
            // GitHub callback might be http://localhost/callback or custom scheme
            // Depending entirely on App settings in GitHub.
            // Assuming http://localhost/callback for consistency.

            if (urlParts.host === 'localhost' && urlParts.pathname === '/callback') {
                event.preventDefault();
                const code = urlParts.query.code;

                if (code) {
                    try {
                        // Exchange code for token
                        const response = await fetch('https://github.com/login/oauth/access_token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                client_id: GITHUB_CLIENT_ID,
                                client_secret: GITHUB_CLIENT_SECRET,
                                code: code
                            })
                        });

                        const data = await response.json();

                        if (data.access_token) {
                            if (store) store.set('githubToken', data.access_token);

                            // Get User
                            const { Octokit } = await import('octokit');
                            const octokit = new Octokit({ auth: data.access_token });
                            const user = await octokit.rest.users.getAuthenticated();

                            isResolved = true;
                            resolve(user.data.login);
                        } else {
                            resolve(false);
                        }
                        authWindow.close();
                    } catch (e) {
                        console.error('GitHub Token Exchange Error', e);
                        isResolved = true;
                        resolve(false);
                        authWindow.close();
                    }
                }
            }
        });

        authWindow.on('closed', () => {
            mainWindow.removeListener('focus', onMainFocus);
            if (!isResolved) resolve(false);
        });
    });
});

ipcMain.handle('github:logout', async () => {
    if (store) store.delete('githubToken');
});

ipcMain.handle('github:createGist', async (event, { name, content, description }) => {
    if (!store) return null;
    const token = store.get('githubToken');
    if (!token) return null;

    try {
        const { Octokit } = await import('octokit');
        const octokit = new Octokit({ auth: token });

        const response = await octokit.rest.gists.create({
            description: description || `Cognitive Library Skill: ${name}`,
            public: true,
            files: {
                [`${name}.md`]: {
                    content: content
                }
            }
        });

        return response.data.html_url;
    } catch (e) {
        console.error('Create Gist Error', e);
        return null;
    }
});

ipcMain.handle('github:updateGist', async (event, { gistId, name, content, description }) => {
    if (!store) return null;
    const token = store.get('githubToken');
    if (!token) return null;

    try {
        const { Octokit } = await import('octokit');
        const octokit = new Octokit({ auth: token });

        const response = await octokit.rest.gists.update({
            gist_id: gistId,
            description: description || undefined,
            files: {
                [`${name}.md`]: {
                    content: content
                }
            }
        });

        return response.data.html_url;
    } catch (e) {
        console.error('Update Gist Error', e);
        return null;
    }
});
