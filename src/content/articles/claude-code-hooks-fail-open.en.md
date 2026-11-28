---
translationKey: claude-code-hooks
lang: en
slug: claude-code-hooks-fail-open
title: Claude Code hooks fail open
publishDate: 28-11-2026
tags:
- agentic-coding
- agents
category: lessons
difficulty: 4
sources:
- label: Claude Code docs, Automate workflows with hooks
  url: https://code.claude.com/docs/en/hooks-guide
  date: 25-11-2026
- label: Claude Code docs, Hooks reference
  url: https://code.claude.com/docs/en/hooks
  date: 25-11-2026
- label: 'Blake Crosley, Claude Code Hooks Tutorial: 5 Production Hooks From Scratch'
  url: https://blakecrosley.com/blog/claude-code-hooks-tutorial
  date: 10-03-2026
- label: Blake Crosley, Claude Code Hooks Explained
  url: https://blakecrosley.com/blog/claude-code-hooks-explained
  date: 01-07-2026
- label: Wiz Research, keyv and cacheable npm supply chain attack
  url: https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
  date: 04-08-2026
contentHash: sha256:1ea744e21dcea46b
publishState: published
---


A Claude Code hook guarantees that your command runs; whether it can stop anything depends on its event, its exit code and one setting whose default lets the action through. Usually it goes wrong in a dull way: a guard script hits input it did not expect, Python exits 1 with a traceback, and the command the guard was written to stop runs anyway.

## Where a hook sits

The guide that introduces hooks promises that certain actions "always happen" instead of depending on the model choosing to run them [s1]. What always happens is that a shell command you declare in `settings.json`, under an event name such as `PreToolUse` or `Stop` and narrowed by a matcher, runs when its event fires [s6].

```
settings.json
  hooks
    PreToolUse                      <- event: when it fires
      matcher: "Bash"               <- which tool calls
        type: "command"
        command: .claude/hooks/guard.py   <- what runs; its exit code decides
```

## Three of these four can say no

The event list is long, but Blake Crosley counts five events behind nearly every production setup (PreToolUse, PostToolUse, UserPromptSubmit, SessionStart and Stop) [s11]. Leave SessionStart aside, and here is what an exit 2 does on the other four:

| Event | Can it block? | What exit 2 does |
|---|---|---|
| PreToolUse | Yes | Blocks the tool call before it runs [s2] |
| UserPromptSubmit | Yes | Blocks the prompt [s7] |
| Stop | Yes | Keeps Claude from stopping, so the conversation goes on [s8] |
| PostToolUse | No | Shows stderr to Claude, after the tool has already run [s9] |

People misread the last row. A hook that scans an edited file for an API key finds the key once it is on disk, so the check that keeps it off the disk has to run in PreToolUse; the PostToolUse version can only tell Claude about it, which is a little late if a watcher has already synced the file somewhere.

## Exit 2 or the call goes through

For a PreToolUse guard on Bash, the exit code is the policy. Exit 2 blocks the command, while exit 1 without valid JSON output is a non-blocking error that only warns and lets it run, so a hook meant to enforce a policy exits 2 [s5] [s15]. With plain exit codes, a guard behaves like this:

```
tool call --> PreToolUse guard --+-- exit 0 (no JSON) -----------> call runs
                                 +-- exit 2 ---------------------> call blocked
                                 +-- anything else --------------> call runs, with a warning
                                     (exit 1, traceback, bad path, timeout)
```

This covers plain exit codes with `onFailure` left at its default. Hooks can also answer with JSON, which I leave aside except for one detail: exit 2 wins, and an "allow" in the same output does not lift the block [s3].

Here is a guard small enough to read in one go. It also has to be fast: it sits in front of every matched call, so it must answer in under 500ms [s5], and a guard that is slow on every `ls` is a guard someone will eventually comment out. It takes the event as JSON on stdin, pulls out the command and refuses `rm -rf`:

```python
#!/usr/bin/env python3
import json
import re
import sys


def main() -> int:
    event = json.load(sys.stdin)
    command = event["tool_input"]["command"]
    if re.search(r"\brm\s+-rf\b", command):
        print("blocked: rm -rf", file=sys.stderr)
        return 2
    return 0


sys.exit(main())
```

You can test it without Claude Code at all, by piping the event yourself. Three cases, with their real output:

```
$ printf '%s' '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/build"}}' | python3 guard.py; echo "exit=$?"
blocked: rm -rf
exit=2
$ printf '%s' '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | python3 guard.py; echo "exit=$?"
exit=0
$ printf 'not json' | python3 guard.py 2>/dev/null; echo "exit=$?"
exit=1
```

The third case is the bug you will actually ship. Some input the guard did not expect (a payload without a `command` key, a shape you never saw while writing it, a byte that breaks the decoder) raises an exception, Python exits 1 with a traceback, and the hook run ends as a non-blocking error, which means the hook did not stop the action [s10]. The `rm -rf` then runs, and the only trace is a warning in a transcript nobody is reading at that moment. (The reference spells all of this out; it is just not the page you read before writing your first guard.) People test the first two cases because those are what the guard was written for. Put the third one in CI next to them, with an assertion on the exit status.

## Make the failure block too

There is a field for exactly this. On most events, a hook that fails or times out still lets the action happen, wrong path and crashing script included, unless you set `"onFailure": "block"` on it, which makes the failure block instead (Claude Code v2.1.295 or later) [s14]. Applied to the guard above, the settings entry becomes:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.py",
            "onFailure": "block"
          }
        ]
      }
    ]
  }
}
```

I would set this on every PreToolUse hook that enforces a policy, and accept what it costs. A guard with a typo in its path now refuses every Bash call until someone fixes it, and a guard that is sometimes slow turns into an intermittent refusal that will annoy you on a Friday afternoon. That is still the better way to fail. A broken fail-closed guard announces itself on the first call, while a broken fail-open guard looks exactly like a working one until the one call it existed for.

If you are stuck on a client older than v2.1.295 [s14], the guard has to turn its own crashes into exit 2:

```python
try:
    sys.exit(main())
except Exception:
    print("guard crashed, blocking", file=sys.stderr)
    sys.exit(2)
```

`SystemExit` does not derive from `Exception`, so the normal exits 0 and 2 pass straight through and only real crashes are converted. A wrong path or a missing interpreter never reaches the `try`, so on an old client those two cases still let the call through.

The shell test proves the script, not the client, and I have not watched `onFailure` act in a live session. Checking it takes a minute: point the hook at a path that does not exist, ask Claude for an `ls`, and confirm the call is refused.

## Stop hooks that never let go

A Stop hook can refuse to let Claude stop, which keeps the conversation going [s8]. That is how you build "do not finish until the tests pass", and it is also how you build a loop. There is a cap: after 8 consecutive blocks (raise it with `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`), Claude Code overrides the next one and ends the turn [s12] [s16].

Do not count on it for the gate you most want to write. A gate that blocks on failing tests has Claude rerun the tests on every pass, each rerun is a tool call, and each tool call resets the count of consecutive continuations, so the gate may never reach eight [s16]. In a session where the tests cannot pass, the gate spends continuation after continuation on a condition that will not change. (A test suite that needs a database that is down does not improve with persistence.)

The loop comes from a gate that never checks whether it already forced a continuation [s12], and that check has a field: `stop_hook_active` is true when Claude Code is already continuing because of a stop hook [s16]. Make reading it the first thing the gate does, and exit 0 when it is true.

## The hooks file is code you run

Everything above treats the hook as your code, written by you to protect you. It is also just code that runs. Command hooks execute with your full user permissions and can modify, delete or read any file your account can reach [s4]. Attackers have noticed. In Wiz Research's analysis of the keyv and cacheable npm compromise, the malware attempted persistence through Claude Code hooks, alongside VS Code's `tasks.json` [s13].

So treat `.claude/settings.json` and `.claude/hooks/` the way you treat a CI workflow. Changes to them go through review, and a new hook in a pull request gets the same reading as a new step in the pipeline. Before you start a session in a repository you just cloned, look at what it declares. Hooks can also come from your user settings, a local settings file or a plugin, so the command below answers one question only, what this repository adds:

```
jq '.hooks' .claude/settings.json
```

## Quiz

<details><summary>A PostToolUse hook exits 2 when an edit writes an API key into a file. Is the key on disk?</summary>Yes. PostToolUse runs after the tool, so stderr reaches Claude but the write has already happened [s9]. If the key must never land, the check belongs in PreToolUse.</details>

<details><summary>Your PreToolUse guard raises on input it cannot parse. What happens to the Bash call, and which setting changes that?</summary>The call runs, because a crashing hook is a failure and by default Claude Code still carries out the action. Setting `"onFailure": "block"` on the hook makes the failure block instead [s14].</details>

<details><summary>You set `"onFailure": "block"` on the guard, then a refactor moves `guard.py` and nobody updates the path. Claude asks to run `ls`. What happens, and what would have happened without the setting?</summary>The `ls` is refused: a hook that cannot run is a failure, and the setting turns failures into blocks [s14]. Without it the `ls` would run, and so would the next `rm -rf`, with nothing in the session telling you the guard was gone.</details>

<details><summary>A Stop gate blocks whenever the tests fail and never reads `stop_hook_active`. What do you see in a session where the tests cannot pass?</summary>Claude keeps going after the failing tests, and the loop may not end at eight continuations: if Claude runs the tests on each pass, each of those tool calls resets the count [s16]. The gate itself has to read the flag and give up on the first repeat.</details>
