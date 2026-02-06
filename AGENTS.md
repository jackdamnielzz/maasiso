# Repository Agent Defaults

## Auto Commit + Push
- Execute `$auto-commit-push` after every completed task that modifies repository files.
- Commit and push immediately after implementation and verification, without waiting for a separate user prompt.
- Keep commit scope limited to files related to the current request.
- Never include unrelated local changes unless explicitly requested.
- If there are no changes to commit, report that explicitly.
- If push fails, report the exact blocking error and the next required action.

## Scope
- Apply these defaults for all future chats in this repository.
