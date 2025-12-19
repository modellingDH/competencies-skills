# How-To Guide: Using Cognitive Skills with AI Agents

This guide explains how to take the entities you've created or found in the **Cognitive Library** and plug them into common AI agents and orchestrators.

## 1. Google Gemini (System Instructions)
Gemini works best when you provide the Markdown content of a **Competency** or **Skill** directly into its System Instructions.

- **Manual**: Copy the Markdown from the "View Details" page and paste it into the "System Instructions" field in Google AI Studio or the Gemini web interface.
- **API**: Send the Markdown as the `system_instruction` parameter in the `generateContent` request.
- **Tool Use**: If your Skill uses **Tools**, define them using the **Tool Schema (JSON)** provided in the Studio's sidebar.

## 2. OpenAI (GPTs & Assistants)
OpenAI agents benefit from the structured nature of our library to reduce hallucinations.

- **Custom GPTs**: Zip your project (Export ZIP) and upload it to the "Knowledge" section of your GPT, or copy the Skill Markdown into the "Instructions" box.
- **Assistant API**: Upload the Skill Markdown files as `code_interpreter` files or inject them into the `instructions` field.
- **Tools**: Convert our Tool definitions into OpenAI's `functions` format (supported natively in our Exports).

## 3. Anthropic Claude (System Prompts)
Claude's long context window and reasoning capabilities make it ideal for **Competencies**.

- **System Prompt**: Inject the full text of a Competency into the system prompt.
- **Artifacts**: Use the Library's generated JSON-LD as a reference "Artifact" that Claude can query during a conversation.
- **Orchestration**: Direct Claude to follow the "Cognitive Markdown" workflows (e.g., `> ACTION`, `? DECISION`) as strict procedural guardrails.

## 4. Cursor (The IDE)
You can use the library as a source of truth for your AI-assisted coding.

- **.cursorrules**: Copy your Skill definitions into a `.cursorrules` file in your repository. This makes the agent follow your defined "Best Practices" for those specific tasks.
- **@docs**: Add the URL of your hosted Library (or individual registry.json) to Cursor's `@docs` feature to make the agent aware of your available Tools and Skills.

## 5. Orchestrators (n8n)
For automated workflows, use the library as a configuration layer.

- **AI Agent Node**: Use the "AI Agent" node and connect a "Knowledge" source that points to your Library's exports.
- **Dynamic Context**: Use an HTTP Request node to fetch a Skill's Markdown content dynamically from your GitHub repository based on the task type, then feed it into the Agent's prompt.
- **Tool Mapping**: Map our Tool definitions directly to n8n "Tool" nodes for seamless API execution.

---

## Technical Maintenance
This guide is maintained as a GitHub-backed Markdown file. You can contribute to it or improve the instructions for new agents by submitting a Pull Request to the repository.
