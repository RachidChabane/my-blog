---
translationKey: curl-8-22-0-openssl-provider-use-after-free
lang: en
slug: curl-8-22-0-openssl-provider-use-after-free-low-severity
title: curl 8.22.0 fixes an OpenSSL provider use-after-free rated low severity
publishDate: 04-09-2026
kind: security
tags:
- curl
- OpenSSL
- CVE
- security
- Aisle
summary: curl 8.22.0, published on September 2 2026, fixes CVE-2026-80229, a heap-use-after-free
  reachable in OpenSSL 3 provider configurations and rated low severity [s1]. The
  affected range is curl 8.14.0 to and including 8.21.0 [s1], so I think the exposed
  fleet here is the one that kept up, not the one that fell behind.
sources:
- label: curl project security advisory, CVE-2026-80229
  url: https://curl.se/docs/CVE-2026-80229.html
  date: 02-09-2026
- label: Aisle Research writeup on its curl vulnerability reports
  url: https://aisle.com/blog/aisle-discovered-six-curl-cves-after-openai-and-anthropic-found-zero
  date: 02-09-2026
contentHash: sha256:9d8dfa287bb12c05
publishState: published
---

## What changed

curl 8.22.0 shipped on September 2 2026, coordinated with the publication of the
CVE-2026-80229 advisory [s1]. In OpenSSL 3 provider configurations, libcurl attached an
allocated library context to the easy handle without acquiring an ownership reference, so
destroying that handle prematurely freed the context while the live connection kept a
dangling pointer, and later I/O hit a heap-use-after-free [s1]. The advisory classifies it
as CWE-416: Use After Free at Severity: low, with affected versions curl 8.14.0 to and
including 8.21.0 [s1]. Stanislav Fort of Aisle Research reported it on August 24 2026
[s1][s2].

## The version window runs backwards

Read the range before you read the severity. The not-affected versions are curl < 8.14.0
and >= 8.22.0 [s1], so the exposed fleet is the one that kept moving across the 8.14 to
8.21 line, while a service still pinned below 8.14.0 never had the bug. That inverts the
triage reflex, which sends you after the stalest binary first. I would run the inventory
the other way this week: list what tracks curl closely and links OpenSSL 3, since providers
exist only in libcurl built to use OpenSSL 3+ [s1], then check whether anything there can
destroy an easy handle while a pooled connection is still live.

Low severity measures how narrow the configuration is. The failure inside it is a
heap-use-after-free [s1]. In my experience that caveat mostly means nobody has enumerated
who is in it.

The advisory asks for one of three actions immediately, in order of preference: upgrade
curl and libcurl to 8.22.0, apply the patch and rebuild, or enable CURLOPT_FORBID_REUSE
for transfers using providers [s1].

```c
/* Recommendation C, scoped to transfers using providers */
curl_easy_setopt(easy, CURLOPT_FORBID_REUSE, 1L);
```

> [!IMPORTANT]
> I would treat C as an emergency measure covering the days before a rebuild lands, then
> take the line back out. It is scoped to transfers using providers for a reason:
> forbidding reuse changes how your connections behave.

## Impact on your team

The decision this week is not whether to upgrade, it is who owns the rebuild. libcurl is a
vendored dependency far more often than a package you installed, so the version that
matters is the one baked into your images and your language bindings, far from the build
host. Aisle Research says six of its 29 reports to the curl project became CVEs in
8.22.0, all rated low severity [s2]; a patch process triggered by high-severity findings
skips the whole batch. Pick the components that link OpenSSL 3, get 8.22.0 into them, and
keep CURLOPT_FORBID_REUSE out of the permanent configuration.
