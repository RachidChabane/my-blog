---
translationKey: modular-mojo-1-0-language-stability-release
lang: en
slug: mojo-1-0-converges-language-surface-var-pointer
title: Mojo 1.0 converges on var, unified closures and a single Pointer type
publishDate: 12-08-2026
kind: release
tags:
- Mojo
- Modular
- compilers
- GPU programming
summary: 'Modular released Mojo 1.0 on 11 August 2026: variables are consistently
  declared with var, closures are unified, there is a single Pointer type, and Python-style
  lambda syntax arrives alongside an LSP server Modular calls far more stable and
  Mojo AI Skills covering porting from other languages. The Register reports the standard
  library is available under v2.0 of the Apache License with LLVM Exceptions, and
  that Modular said it intends to open-source the compiler this year. I think the
  pairing of a steadier LSP with a porting skill says where Modular expects the friction,
  and who it expects to absorb it.'
sources:
- label: Modular release announcement, Mojo 1.0
  url: https://www.modular.com/blog/modular-26-5-mojo-1-0-is-here
  date: 11-08-2026
- label: The Register
  url: https://www.theregister.com/ai-and-ml/2026/08/12/modulars-mojo-programming-language-hits-10-milestone/5286545
  date: 12-08-2026
contentHash: sha256:fb86541d1ad72ff6
publishState: published
---

## What changed

Modular released Mojo 1.0 on 11 August 2026, and it is a convergence release: variables are now
consistently declared with `var`, closures are unified, there is a single `Pointer` type, and
renamings complete what Modular calls the final cleanup [s1]. The release also adds
Python-style `lambda` syntax, an LSP server Modular calls far more stable, and
Mojo AI Skills it calls 1.0 ready for GPU programming and porting from other languages [s1].
The Register reports the standard library is available under v2.0 of the Apache License with
LLVM Exceptions, and that Modular said it intends to open-source the compiler this year [s2].

## Who Modular expects to do the migration

Read this release as a statement about labour rather than about syntax. A cleanup that renames
things and deletes the second way of writing them is, for anyone with Mojo already in a repo,
an edit pass over working code [s1]. What shipped beside it is the tell: a language server
Modular calls far more stable, and AI Skills whose advertised coverage includes porting from
other languages [s1]. I think that pairing names where Modular expects the friction, and who it expects to
absorb it.

The bet is sound on the mechanical half, where renames are what an agent does well and the
compiler is the oracle. The semantic half is the residue: unified closures and one `Pointer`
type change what code means [s1], and I would not expect a skill file to tell you which of your
pointer casts were load-bearing. That is where the week goes.

> [!IMPORTANT]
> The feature list above has one origin, Modular's own release post [s1]. What a separate
> newsroom reports is the licensing half: the standard library under v2.0 of the Apache License
> with LLVM Exceptions, and a stated intent to open-source the compiler this year [s2]. An
> intent is not a licence, and I would weigh the two differently.

## Impact on your team

If Mojo is already in a repo, plan the 1.0 move as a source edit rather than a version bump,
and do it before you build on top [s1]. If it is not, the decision is narrower than adopting the
language: whether one bounded GPU component is worth writing in Mojo, since that is
where the tooling and skills are aimed [s1]. I would not move a Python service on
the strength of a version number. The question to re-ask this year is the licensing one: an
Apache licence covers the standard library you read, while the compiler that builds it is so
far an intention [s2].
