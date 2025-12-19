/**
 * Generates a unique ID from a name by combining slug + short hash
 * Example: "Network Diagnosis" -> "network_diagnosis_a3f2"
 */
export function generateId(name: string): string {
    // Create slug from name
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    // Simple hash function (similar to Java's hashCode)
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex and take first 4 characters
    const hashStr = Math.abs(hash).toString(16).substring(0, 4);

    return `${slug}_${hashStr}`;
}
