import { Interpreter } from './md_to_jsonld';

const markdown = `
- @ CONTEXT: Check if 'LAVA' is nearby.
- ? DECISION: Is distance < 1m?
    - YES:
        - ! CRITICAL: Stop immediately.
        - > ACTION: Plan detour.
    - NO:
        - > ACTION: Move forward using \`move_forward()\`.
`;

const interpreter = new Interpreter();
const jsonld = interpreter.process(markdown, "Test Navigation Skill");

console.log(JSON.stringify(jsonld, null, 2));
