# Kodo v1 — Feature Roadmap

> The four features that make Kodo its own thing.

## Overview

| # | Feature                      | Effort | Builds On                          |
|---|------------------------------|--------|------------------------------------|
| 1 | Slash Commands (expanded)    | Medium | Existing `SLASH_COMMANDS` system   |
| 2 | Skills System                | Large  | New — plugin architecture          |
| 3 | Project Archiving (full)     | Medium | Existing thread archive commands   |
| 4 | Shell + Environment Selector | Medium | Existing terminal PTY + env dict   |

---

## Feature 1: Slash Commands (Expanded)

### What exists today
- `composer-logic.ts` has `SLASH_COMMANDS: ["model", "plan", "default"]`
- `ComposerCommandMenu.tsx` renders the trigger menu
- Parsing via `splitPromptIntoComposerSegments()`

### What Kodo adds
Extensible command registry with categories, arguments, and previews.

### Proposed commands

| Command | Category | Description |
|---------|----------|-------------|
| `/archive` | Project | Archive current project with metadata |
| `/restore <name>` | Project | Restore an archived project |
| `/shell <shell>` | Terminal | Switch terminal shell (bash, zsh, pwsh, fish, cmd) |
| `/env <name>` | Terminal | Switch environment (node version, python venv, etc.) |
| `/theme <name>` | UI | Switch UI theme |
| `/export` | Conversation | Export current conversation |
| `/clear` | Conversation | Clear current thread |
| `/skill <name>` | Skills | Run a registered skill |
| `/skills` | Skills | List available skills |
| `/help` | Meta | Show all available commands |

### Architecture

```
packages/contracts/src/
  slash-commands.ts           # Command registry schema
    - SlashCommandDefinition  # { name, category, args, description, handler }
    - SlashCommandRegistry    # Map<string, SlashCommandDefinition>

apps/web/src/
  commands/
    registry.ts               # Central command registry
    builtins.ts               # Built-in commands (archive, shell, env, etc.)
    parser.ts                 # Argument parsing + validation
  components/chat/
    ComposerCommandMenu.tsx   # Updated: categories, search, arg hints
```

### Key decisions
- Commands are **client-first** — parsed and dispatched from the browser
- Commands that need server action dispatch via existing `orchestration.dispatchCommand()`
- Registry is extensible — skills can register their own commands

---

## Feature 2: Skills System

### Vision
Skills are modular capabilities that extend Kodo — similar to plugins but
more focused. Each skill can:
- Register slash commands
- Hook into agent conversations (pre/post processing)
- Add UI panels
- Access project context

### Architecture

```
packages/contracts/src/
  skills.ts                    # Skill manifest schema
    - SkillManifest            # { id, name, version, commands, hooks, ui }
    - SkillHook                # { event, handler }
    - SkillCommand             # { name, args, handler }

apps/server/src/
  skills/
    Layers/SkillManager.ts     # Skill lifecycle (load, enable, disable)
    registry.ts                # Server-side skill registry
    loader.ts                  # Load skills from disk / packages
    builtin/                   # Built-in skills
      code-runner.ts           # Run code snippets inline
      git-tools.ts             # Git shortcuts
      project-templates.ts     # Project scaffolding

apps/web/src/
  skills/
    SkillStore.ts              # Zustand store for skill state
    components/
      SkillPanel.tsx           # UI for managing skills
      SkillCommandMenu.tsx     # Skill commands in slash menu
```

### Skill manifest example
```typescript
const mySkill: SkillManifest = {
  id: "code-runner",
  name: "Code Runner",
  version: "1.0.0",
  description: "Run code snippets inline",
  commands: [
    { name: "run", description: "Run current code block", args: ["--lang"] },
    { name: "repl", description: "Open inline REPL", args: ["--lang"] },
  ],
  hooks: [
    { event: "turn.complete", description: "Auto-run test commands after agent edits" },
  ],
};
```

### Phases
1. **Phase 1**: Built-in skills only, hardcoded registry
2. **Phase 2**: Skill manifest format, load from `~/.kodo/skills/`
3. **Phase 3**: Community skill sharing / marketplace

---

## Feature 3: Project Archiving (Full)

### What exists today
- Thread-level archive/unarchive commands
- `archivedAt` field on thread model
- Server projector handles archive events

### What Kodo adds
**Full project-level archiving** — snapshot an entire project state and restore it later.

### Data model

```typescript
// New contract types
ProjectArchive = Schema.Struct({
  archiveId: ArchiveId,
  projectId: ProjectId,
  name: Schema.String,
  description: Schema.optionalWith(Schema.String, { as: "Option" }),
  createdAt: IsoDateTime,

  // Snapshot data
  threads: Schema.Array(ThreadSnapshot),        // All threads + messages
  settings: ProjectSettings,                     // Project-level settings
  gitRef: Schema.optionalWith(Schema.String, { as: "Option" }),  // Git commit hash
  envProfile: Schema.optionalWith(EnvProfile, { as: "Option" }), // Environment snapshot

  // Metadata
  tags: Schema.Array(Schema.String),
  size: Schema.Number,                           // Archive size in bytes
});
```

### Commands

```typescript
// New orchestration commands
"project.archive.create"    // Snapshot current project state
"project.archive.restore"   // Restore from archive
"project.archive.delete"    // Delete an archive
"project.archive.list"      // List archives for a project
"project.archive.export"    // Export archive as file
"project.archive.import"    // Import archive from file
```

### UI
- **Archive Manager panel** in sidebar — browse, search, restore
- **Archive button** on project header — quick archive with name/tags
- **Archive diff view** — compare current state vs archived state
- **Export/Import** — share archives as `.kodo-archive` files

### Storage
- Archives stored in SQLite alongside existing event store
- Large binary data (terminal history, etc.) compressed with gzip
- Export format: JSON + gzip bundle

---

## Feature 4: Shell + Environment Selector

### What exists today
- Terminal PTY adapters (BunPTY / NodePTY)
- `TerminalOpenInput` accepts optional `env` dict
- Platform auto-detection for default shell
- `TERMINAL_ENV_BLOCKLIST` for env filtering

### What Kodo adds
**UI for selecting shell and runtime environment per project/thread.**

### Shell selection

```typescript
// New contract types
ShellProfile = Schema.Struct({
  id: ShellProfileId,
  name: Schema.String,               // "PowerShell 7", "Git Bash", "WSL Ubuntu"
  command: Schema.String,             // "pwsh.exe", "bash.exe", "wsl.exe"
  args: Schema.Array(Schema.String),  // ["--login", "-i"]
  env: Schema.Record(Schema.String, Schema.String),  // Extra env vars
  icon: Schema.optionalWith(Schema.String, { as: "Option" }),
  isDefault: Schema.Boolean,
});

// Auto-detected shells (platform-specific)
// Windows: cmd, PowerShell 5, PowerShell 7, Git Bash, WSL distros
// macOS: zsh, bash, fish
// Linux: bash, zsh, fish, sh
```

### Environment profiles

```typescript
EnvProfile = Schema.Struct({
  id: EnvProfileId,
  name: Schema.String,               // "Node 22", "Python 3.13 venv", "Rust nightly"
  type: Schema.Literal("node", "python", "rust", "go", "custom"),
  
  // Runtime-specific
  runtime: Schema.optionalWith(Schema.String, { as: "Option" }),      // "node", "bun", "deno", "python"
  version: Schema.optionalWith(Schema.String, { as: "Option" }),      // "22.16", "3.13"
  venvPath: Schema.optionalWith(Schema.String, { as: "Option" }),     // Python venv path
  
  // Environment variables to inject
  env: Schema.Record(Schema.String, Schema.String),
  pathPrepend: Schema.Array(Schema.String),         // Prepend to PATH
});
```

### UI components

```
apps/web/src/components/terminal/
  ShellSelector.tsx           # Dropdown in terminal header — pick shell
  EnvSelector.tsx             # Dropdown — pick environment profile  
  EnvProfileEditor.tsx        # Create/edit environment profiles
  ShellDetector.tsx           # Auto-detect available shells on system
```

### Flow
1. User opens terminal → sees current shell in terminal header
2. Click shell name → dropdown with detected shells
3. Click env badge → dropdown with saved env profiles + "New profile"
4. Switching shell/env → restarts terminal session with new config
5. Per-project default shell/env saved in project settings

---

## Implementation Order

```
Phase 1 (Foundation)          Phase 2 (Core Features)       Phase 3 (Polish)
========================      ========================      ========================
 Slash command registry        Skills system (built-in)       Skill manifests + loader
 Shell auto-detection          Project archiving              Archive export/import
 Shell selector UI             Environment profiles           Community skills
 Basic /help, /shell, /env     Archive manager UI             Theme engine
                                Code runner skill              Plugin marketplace
```

### Phase 1 — Start here (weeks 1-3)
1. Expand slash command registry + parser
2. Shell auto-detection + selector UI
3. Environment profile data model + selector UI
4. Wire up `/shell` and `/env` commands

### Phase 2 — Core features (weeks 4-7)
5. Skills architecture (built-in only)
6. Project archive data model + commands
7. Archive manager UI
8. Code runner as first skill

### Phase 3 — Polish (weeks 8+)
9. Skill manifest format + disk loader
10. Archive export/import
11. Community sharing
12. Theme engine + keybinding editor
