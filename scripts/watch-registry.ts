
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const LIBRARY_DIR = path.join(process.cwd(), 'library');
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 1000;

function updateRegistry() {
    console.log('Change detected. Updating registry...');
    exec('npm run update-registry', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error updating registry: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Registry update stderr: ${stderr}`);
        }
        console.log(stdout);
        console.log('Registry updated successfully. Watching for changes...');
    });
}

function watchDirectory(dir: string) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.md') || filename.endsWith('.json'))) {
            // Debounce to avoid multiple runs for single save
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                updateRegistry();
            }, DEBOUNCE_MS);
        }
    });
}

console.log(`Starting watcher on ${LIBRARY_DIR}...`);
// Initial Run
updateRegistry();
watchDirectory(LIBRARY_DIR);
