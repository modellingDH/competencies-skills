import { Octokit } from 'octokit';
import { getServerSession } from "next-auth";
import { GET } from "./api/auth/[...nextauth]/route"; // Import auth options handler
import { Interpreter } from '../interpreter/md_to_jsonld';

export async function validateSkill(markdown: string): Promise<{ success: boolean; data: any; error: string | null }> {
    try {
        const interpreter = new Interpreter();
        // Use a dummy name 'Preview'
        const jsonld = interpreter.process(markdown, 'Preview');
        return { success: true, data: jsonld, error: null };
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
}

export async function commitSkill(
    filename: string,
    content: string,
    message: string,
    accessToken: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const octokit = new Octokit({ auth: accessToken });

        // Parse owner/repo from env or constant
        const repoString = process.env.GITHUB_REPO || "modellingDH/competencies-skills";
        const [owner, repo] = repoString.split('/');
        if (!owner || !repo) throw new Error("Invalid GITHUB_REPO env var");

        const path = `src/data/skills/${filename}`;

        // Get SHA if file exists (for update)
        let sha: string | undefined;
        try {
            const { data: existing } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            // Check if existing is a single file (not array) and has sha
            if (!Array.isArray(existing) && 'sha' in existing) {
                sha = existing.sha;
            }
        } catch (e) {
            // File doesn't exist, proceed with create
        }

        const { data: commit } = await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: Buffer.from(content).toString('base64'),
            ...(sha ? { sha } : {}),
        });

        const htmlUrl = commit.commit.html_url;
        return { success: true, ...(htmlUrl ? { url: htmlUrl } : {}) };
    } catch (error: any) {
        console.error("Commit failed:", error);
        return { success: false, error: error.message };
    }
}
