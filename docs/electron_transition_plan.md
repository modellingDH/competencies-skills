# Plan: Desktop App with Embedded Gemma, Google Drive, and GitHub Integration

## 1. Executive Summary

This plan outlines the transformation of the current "Cognitive Library" web application into a cross-platform desktop application using **Electron**. It aims to provide a "Privacy First" AI authoring environment with local inference (Gemma 2B), while bridging the gap to the cloud via **Google Drive** for storage and open sharing, and **GitHub** for community contribution.

## 2. Architecture: Electron + Next.js + Local AI

### 2.1 Core Stack

* **Framework**: Electron (Main Process) + Next.js (Renderer).
* **Boilerplate**: `electron-vite` or a manual setup wrapping the existing Next.js app output.
* **Local AI**: `WebLLM` (as verified in feasibility study) running in the Renderer process (or a hidden window) to leverage WebGPU.

### 2.2 Integration Strategy

1. **Migrate**: Adjust `next.config.js` for `output: 'export'` (Static Export) to serve files within Electron.
2. **IPC Bridge**: Create a secure ContextBridge to exposing Node.js capabilities (File System, Shell) to the React frontend only where necessary.

## 3. Google OAuth & Drive Integration (Cloud Storage)

### 3.1 Authentication

* **Strategy**: Use `electron-google-oauth` (or similar loopback flow) to handle authentication securely in the Desktop context without a backend server.
* **Scope**: `https://www.googleapis.com/auth/drive.file` (Recommended: only access files created by the app) or `drive.readonly` + `drive.file`.

### 3.2 Storage & Sharing Model

* **Save Location**: A dedicated `Cognitive Library` folder in the user's Google Drive.
* **Public Link Generation**:
  * Use the Drive API `permissions.create` endpoint to setting `role: reader`, `type: anyone`.
  * **Agent Access**: Construct a direct download URL: `https://drive.google.com/uc?export=download&id=FILE_ID`.
  * *Constraint*: Verify if CORS headers on this URL allow browser-based agents to fetch. If not, the "Online Agent" must be server-side.

## 4. GitHub Integration (Community Registry)

### 4.1 "No-Effort" Contribution Strategy: **IssueOps via Gists**

Directly managing a git repo inside the desktop app is complex and error-prone for non-technical users. "Pushing" to a protected repo requires complex auth.

**The Proposal: Gist + Issue Submission**

1. **User Action**: User clicks "Share with Community" in the Studio.
2. **System Action**:
    * App creates a public **GitHub Gist** with the valid Markdown content (via GitHub API).
    * App opens a pre-filled **New Issue** URL on the official `cognitive-library-registry` repository.
    * **Payload**: The Issue body contains the Gist URL and metadata (YAML).
3. **Automation (Server-Side)**:
    * A GitHub Action (`on: issues`) parses the issue.
    * Validates the Gist content (using the same validators we built).
    * **Auto-Merge**: If valid, the Action commits the file to the repo and closes the issue.
    * **Feedback**: Bot comments on the issue if validation fails.

**Benefits**:

* No git installation required on user machine.
* User owns their content (Gist).
* Maintainers have full control (Automated Gatekeeper).
* Zero maintenance for "Push permissions".

## 5. Feasibility Assessment

### 5.1 Electron + Next.js

* **Feasibility**: High. Standard pattern.
* **Risk**: Next.js Image/Router behavior in `file://` protocol. *Mitigation*: Use HashRouter or specific Electron-friendly router adjustments.

### 5.2 Embedded Gemma (WebLLM)

* **Feasibility**: High (Verified).
* **Constraint**: Hardware requirements (GPU).

### 5.3 Google Drive Public Links

* **Feasibility**: High. API is mature.
* **Risk**: URL structure changes or Virus Scan interstitials for large files (unlikely for Markdown).

### 5.4 GitHub IssueOps

* **Feasibility**: Medium-High. Requires setting up the receiving Repository workflows.
* **Experience**: Very low friction for the user (One click to Gist -> Review Issue).

## 6. Implementation Roadmap

1. **Phase 1: Electron Wrapper**: [Done] Get the current app running in an Electron window (Static Export + IPC).
2. **Phase 2: Local AI**: [Done] Integrate WebLLM for the "AI Assist" feature.
3. **Phase 3: Drive Integration**: [Done] Implement OAuth and File Save/Load to Drive.
4. **Phase 4: Community Sharing**: [Done] Implement the Gist creation + Issue Template link generation.
