# Electron Implementation Notes

## Architecture

The application has been adapted to run as a **Static Export** (`next export`) served by an **Electron** main process.

### Components

1. **Electron Main Process** (`electron/main.js`):
    * Handles window creation.
    * Serves static files from `out/` in production.
    * Provides IPC handlers for:
        * `dialog:openDirectory`: Open native folder picker.
        * `workspace:load`: Read markdown files from a directory structure.
        * `workspace:saveFile`: Write markdown files consistent with library structure.
        * `workspace:getPath`: Retrieve last opened workspace.

2. **Preload Script** (`electron/preload.js`):
    * Exposes `window.electronAPI` safely via `contextBridge`.

3. **Frontend Integration**:
    * `WizardContext.tsx` detects `window.electronAPI`.
    * `InstructionsStep.tsx` shows "Desktop Workspace" controls if running in Electron.
    * `src/types/electron.d.ts` provides TypeScript definitions.

## Build Process

1. `npm run build`: Generates the static Next.js export in `out/`.
2. `npm run electron:build`: Packages the `out/` folder and `electron/` scripts into a native app (dm/AppImage/exe).

## Authentication & Remote Features

* The standard `next-auth` API routes are **disabled** for the Electron build because they require a Node.js server runtime, which isn't available in the static export model.
* **Future Work**: Implement Client-Side OAuth (PKCE) or Electron-based OAuth for Google/GitHub integration, utilizing the main process to handle tokens securely.

## Search Params

* Dynamic `searchParams` usage in `page.tsx` has been removed to support static export.
* Remote entity viewing is currently limited to imported entities. Use the "Import" or "Clone" feature to view remote content locally.
