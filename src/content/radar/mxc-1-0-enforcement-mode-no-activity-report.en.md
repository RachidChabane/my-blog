---
translationKey: mxc-1-0-enforcement-mode-writes-no-activity-report
lang: en
slug: mxc-1-0-enforcement-mode-no-activity-report
title: Microsoft Execution Containers is generally available, and its Enforcement
  mode applies the policy without an activity report
publishDate: 10-10-2026
kind: release
tags:
- Microsoft
- MXC
- Windows
- agents
- sandboxes
summary: Microsoft made Microsoft Execution Containers (MXC) generally available on
  October 7, 2026, with MXC SDK v1.0.0 for Rust, .NET and Node.js. In Microsoft's
  mode table, Enforcement produces no activity report, and only on Windows can MXC
  process containers produce one. I would write the policy in Learning mode inside
  a Windows process container, keep the JSON report, then switch to Enforcement.
sources:
- label: 'Windows Developer Blog, "Microsoft Execution Containers: Policy-driven containment
    for AI agents"'
  url: https://blogs.windows.com/windowsdeveloper/2026/10/07/microsoft-execution-containers-policy-driven-containment-for-ai-agents/
  date: 07-10-2026
- label: GitHub, microsoft/mxc release "MXC SDK v1.0.0"
  url: https://github.com/microsoft/mxc/releases/tag/v1.0.0
  date: 07-10-2026
- label: Rajesh Beri, "Microsoft's MXC Agent Containers Ship Before Intune Can Manage
    Them"
  url: https://www.beri.net/article/microsoft-execution-containers-mxc-ga-windows-11-agent-sandbox-intune-entra-agent-365-coming-soon
  date: 07-10-2026
- label: WindowsForum, "Microsoft Execution Containers v1.0 Goes GA"
  url: https://windowsforum.com/news/microsoft-execution-containers-v1-0-goes-ga-windows-11-updates-isolation-modes-and-agent-security.447534/
  date: 07-10-2026
contentHash: sha256:bd8b396c54ae27ee
publishState: published
---

## What changed

On October 7, 2026, Microsoft made Microsoft Execution Containers (MXC) generally available [s1]. MXC SDK v1.0.0 is the first stable release of the SDK for Rust, .NET and Node.js, with `mxc_sdk::v1`, `Microsoft.Mxc.Sdk.V1` and `@microsoft/mxc-sdk/v1` as entry points [s2][s4]. Developers declare the resources a workload requires, such as files and network destinations, and Microsoft says MXC maps the requested controls to the selected backends on Windows, macOS, or Linux [s1].

## Writing the policy

I think the policy is the portable part of MXC, and the evidence for writing it lives only on Windows. Microsoft's mode table [s1]:

| Mode | Ungranted access | Activity report | Intended use |
| :--- | :--- | :--- | :--- |
| Enforcement | Blocked | No | Run the workload with its production policy |
| Learning | Blocked and recorded | Yes | Diagnose failures and verify that the policy grants only required access |
| Permissive | Allowed and recorded | Yes | Observe agent activity without enforcing policy |

Learning records each blocked operation in a JSON activity report, and only on Windows can MXC process containers produce an agent activity report [s1]. So I treat policy authoring as a step you schedule: run a new agent in Learning mode inside a Windows process container, keep the JSON activity report as the record of what the policy grants, then switch to Enforcement.

The strongest case for Permissive: Learning blocks every ungranted access, while Permissive allows it and records it [s1]. I read that as a Learning pilot stopping at its first missing grant, where a Permissive one runs to the end. I think that trade fails for the workloads Microsoft puts in process containers, which include model-generated code and tool execution [s1]. Under Permissive, that code gets every ungranted access it asks for during the pilot. A broken run costs one more grant.

> [!IMPORTANT]
> Rajesh Beri quotes the repository README: the executor's `--audit` flag "turns off all sandbox security for the workload being analyzed" [s3]. For a pilot, reach for Learning mode instead.

## Impact on your team

Beri notes that until Microsoft ships its Intune controls, the agent's developer writes the boundary [s3]. My call: budget one Learning-mode run per new agent and review its report next to the policy. On macOS or Linux I would expect to review the policy line by line, with no report to check it against.

Code built against pre-1.0 builds must replace legacy sandbox request and lifecycle types with `ContainerRequest`, `ProvisionRequest`, `ExecutionRequest`, `ContainerId` and the corresponding operation-specific options [s2][s4]. V1 is the stable compatibility boundary for the 1.x release line, and MXC will follow semver 2.0 [s2], so I expect this to be the last such rewrite before a 2.0.
