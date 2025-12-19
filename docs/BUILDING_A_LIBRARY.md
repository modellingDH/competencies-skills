# Walkthrough: Building a Public Library Repository

The AI Skills & Competencies framework is designed to be federated. Organizations and individual experts can host their own "Skill Repositories" that others can discover and link to.

## 1. Repository Structure
To create a compatible library, your GitHub repository should follow this structure:

```text
/
├── registry.json           # Fast discovery manifest (Required)
├── competencies/           # Competency definitions (.md)
│   └── example.md
├── skills/                 # Skill definitions (.md)
│   └── example.md
├── tools/                  # Tool definitions (.md)
│   └── example.md
└── concepts/               # Concept definitions (.md)
    └── example.md
```

## 2. The `registry.json` File
This file is the "spine" of your library. It allows the portal to index your content without scanning every folder.

```json
{
  "name": "Cybersecurity Experts Pack",
  "version": "1.0.0",
  "description": "Premium modules for building security-focused AI agents.",
  "entities": [
    {
      "id": "network_analyst",
      "type": "competency",
      "name": "Network Security Analyst",
      "description": "Monitors and analyzes network traffic for threats.",
      "tags": ["security", "networking"],
      "path": "competencies/network_analyst.md"
    },
    {
      "id": "log_analysis",
      "type": "skill",
      "name": "Deep Log Analysis",
      "description": "Technique for parsing large-scale firewall logs.",
      "tags": ["forensics"],
      "path": "skills/log_analysis.md"
    }
  ]
}
```

## 3. Creating "Cognitive Markdown" Content
Each `.md` file in your repo should follow the framework's instructional design rules.

- Use **Schema.org** metadata headers where possible.
- Use structured action blocks: `> ACTION: ...`
- Use logic indicators: `? IF: ... THEN: ...`

## 4. Hosting and Sharing
1. **Public Repo**: Push your code to a public GitHub repository.
2. **Raw Link**: Locate your `registry.json` and copy the GitHub URL.
3. **Distribution**: Users can now add your URL in the **Manage Sources** page of the app.

> [!TIP]
> **Versioning**: Use GitHub Releases or Tags to version your library. Users can link to specific branches or tags by modifying the source URL (e.g., `.../main/registry.json` vs `.../v1.0.0/registry.json`).

## 5. Automated Registry Generation
For large repositories, we recommend using a simple script to generate the `registry.json` automatically during your CI/CD process:

```javascript
// Example Node.js script to update registry.json
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{competencies,skills,tools,concepts}/*.md');
const entities = files.map(file => {
  // Extract metadata from file (e.g., first H1 and front-matter)
  // ... logic to parse MD headers ...
  return { id, type, name, path: file };
});

fs.writeFileSync('registry.json', JSON.stringify({ name: "My Lib", entities }, null, 2));
```
