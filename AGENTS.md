# AGENTS.md

## Bash timeout rule

**Every bash command MUST have explicit `timeout` param.**
Never run cmds that wait indefinitely (Start-Sleep, server without timeout, etc).

```powershell
# WRONG - no timeout, can hang forever
npx playwright test src/tests/e2e

# RIGHT - timeout kills it if hangs
npx playwright test src/tests/e2e  # plus tool timeout parameter
```

## Process management

- NEVER kill all node/bun process by name (`taskkill /F /IM node.exe`, `killall node`)
- This kills opencode itself
- Target specific PID by port: `netstat -ano | Select-String ":4173"` → `Stop-Process -Id $pid -Force`

## Preview server

Use `scripts/serve.ps1`:

```powershell
scripts/serve.ps1 -Rebuild            # rebuild + start on 4173
scripts/serve.ps1 -Kill               # kill process on 4173
scripts/serve.ps1 -Port 4174 -Rebuild # custom port
```

Script returns `ready PID <num>` or `killed PID <num>`. Always runs with timeout.

## Long-running commands

Expected durations + tool timeout:
- `npm run test`: 30s
- `npm run build`: 30s
- `npx playwright test`: 120s
- `scripts/serve.ps1`: 20s (10s poll + buffer)
