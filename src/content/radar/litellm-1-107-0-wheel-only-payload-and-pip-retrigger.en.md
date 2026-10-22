---
translationKey: litellm-1-107-0-wheel-only-payload-and-pip-retrigger
lang: en
slug: litellm-1-107-0-wheel-only-payload-and-pip-retrigger
title: LiteLLM 1.107.0's PyPI wheels carried a credential stealer its GitHub source
  tag did not, and running pip in an infected environment runs it again
publishDate: 22-10-2026
kind: security
tags:
- LiteLLM
- PyPI
- supply chain
- security
summary: 'LiteLLM says its release pipeline was compromised on October 21, 2026 and
  pushed v1.107.0 to PyPI and Docker Hub. LiteLLM says its GitHub source tag is clean,
  while JFrog and SafeDep found the payload in all seven wheels, and SafeDep says
  it dumps the proxy tables that hold LLM provider API keys. LiteLLM and JFrog warn
  that running pip in the affected environment runs it again. My call: clean from
  the shell, pin 1.106.2 and rotate every provider key stored in the LiteLLM proxy
  DB.'
sources:
- label: 'LiteLLM, Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised'
  url: https://docs.litellm.ai/blog/security-incident-oct-21-2026
  date: 21-10-2026
- label: 'JFrog Security Research, LiteLLM Hijacked Again: Malicious 1.107.0 Wheels
    Steal Credentials and Load Remote Code'
  url: https://research.jfrog.com/post/litellm-hijacked-again/
  date: 21-10-2026
- label: SafeDep, Compromised LiteLLM 1.107.0 on PyPI Installs a Credential Stealer
    and Backdoor
  url: https://safedep.io/litellm-pypi-compromise-credential-stealer-backdoor/
  date: 21-10-2026
contentHash: sha256:c2a263be0cf9e206
publishState: published
---

## What changed

LiteLLM says its release pipeline was compromised on October 21, 2026 and pushed v1.107.0 to PyPI and Docker Hub [s1]. Per its report, `litellm==1.107.0` was live on PyPI from 11:39:51 to 13:23 UTC, and the `v1.107.0`, `latest`, `main-latest` and `main-stable` tags pointed to a compromised image from 11:46:56 to 14:20 UTC [s1]. LiteLLM says all previous versions are safe and asks users to pin 1.106.2 [s1].

## Review read the wrong artifact

LiteLLM says the official v1.107.0 source tag in GitHub does not contain the malicious files [s1], yet JFrog found the payload in all seven PyPI wheels, while the source tarball lacks `cook.pth`, `cook.py` and `sitecustomize.py` and carries an added `data = "cook"` setting absent from the Git tag [s2]. I think a team that diffed the tag reviewed everything except the files that execute at startup.

## The check that reruns the payload

JFrog writes that `cook.py` runs during normal Python startup in the affected environment, regardless of whether the application imports litellm [s2].

> [!CONFIRMED]
> LiteLLM's report says you can check with `pip show litellm`, and also that any Python start in the affected environment runs `cook.pth` and `sitecustomize.py` again, including running pip [s1].

> [!INFERRED]
> My reading: the first check the report offers is itself a Python start, so in an environment you have not cleaned, I would look from the shell before pip runs at all.

A shell search for the three names the report lists starts no interpreter, though the report warns that not finding one does not prove the environment is clean [s1]:

```bash
find / \( -name 'cook.pth' -o -name 'sitecustomize.py' -o -name 'litellm-1.107.0.dist-info' \) 2>/dev/null
```

## The strongest objection

Pinning 1.106.2 looks like the whole fix, and for the next install it is. For an environment that already ran 1.107.0, I disagree: the stealer has already run there, and both LiteLLM and JFrog say a missing exfiltration marker proves nothing [s1][s2]. SafeDep adds that hosts that ran the daemon before the deletion could have received and run second-stage code [s3].

## Impact on your team

Treat any environment that installed `litellm==1.107.0` or pulled those Docker tags in those windows as exposed. In LiteLLM's order: from the shell, delete `cook.pth`, `cook.py`, `sitecustomize.py` and the matching `__pycache__` files from every affected site-packages, kill the detached python daemon holding `/tmp/remote_code_loader.lock`, then reinstall pinned to `litellm==1.106.2` [s1]. For a gateway, the costly part is the keys: SafeDep says the stealer dumps `LiteLLM_CredentialsTable` and `LiteLLM_ProxyModelTable`, which hold the LLM provider API keys of a LiteLLM proxy [s3]. My call: rotate every provider key stored in the LiteLLM proxy DB today [s1], and add the installed wheel's RECORD contents to dependency review [s2].
