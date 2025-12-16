import { Interpreter } from './md_to_jsonld';
import { SemanticValidator } from './validator';

const markdown = `
- @ CONTEXT: Check system status.
- ? DECISION: Is system online?
    - YES:
        - > ACTION: Proceed with \`operation()\`.
    - NO:
        - ! CRITICAL: Abort mission.
`;

const interpreter = new Interpreter();
const validator = new SemanticValidator();

console.log("1. Running Interpreter...");
const jsonld = interpreter.process(markdown, "Integration Test Skill");
console.log("   Generated JSON-LD name:", jsonld.name);

console.log("2. Running Semantic Validator...");
const report = validator.validate(jsonld);

console.log("   Validation Result:", report.conforms ? "PASSED" : "FAILED");
if (!report.conforms) {
    console.log("   Errors:", report.results);
}
