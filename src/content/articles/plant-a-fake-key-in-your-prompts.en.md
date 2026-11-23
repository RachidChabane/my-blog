---
translationKey: prompt-leaks-went-around-the-privacy-flag
lang: en
slug: plant-a-fake-key-in-your-prompts
title: Plant a fake key in your prompts
publishDate: 23-11-2026
tags:
- agents
- llm-oss
category: essays
difficulty: 3
sources:
- label: 'Dragos, Three breaches, endless leaks: Your AI supply chain needs canaries:
    We found attackers actively stealing data'
  url: https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens
  date: 19-11-2026
- label: 'Phala, November Preliminary Incident Report: The attacker used a similar
    access'
  url: https://phala.com/posts/phala-november-preliminary-incident-report
  date: 10-11-2026
- label: 'Together AI, Security event: Prompt leakage for requests in June and July
    of 2026: As part of routine software testing'
  url: https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026
  date: 21-11-2026
- label: 'OpenRouter, Data Processing Incidents on Inference Providers: Removed 125
    endpoints from Zero Data'
  url: https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/
  date: 22-11-2026
contentHash: sha256:772ad3e30218c102
publishState: published
---


Put a fake credential in the prompts you send to hosted models, and treat anyone who tries it as a thief. That is how the recent prompt thefts came to light. The security firm Dragos found attackers stealing data from three hosting providers [s1]. Separately, an outside researcher showed the inference host Phala that request data sent to one of its models had been exposed [s29].

## Copied at the door

The stolen prompts were copied off live requests, before ZDR or any retention setting got a say. Some of the stolen keys even came from requests the provider rejected before a model ever ran [s3]. In two of the breaches the haul included requests sent with ZDR on [s2]. That surprised me less once I saw how narrow the flag is, since it binds the first hop you hand the request to and nobody past it [s4].

When I wrote about Fireworks here, the question was what a provider keeps at rest and for how long. At Phala that question would not have helped. The attacker had control of the inference VM, so request data was readable while it was being processed [s9]. The VM sat on a new GPU server that was already serving production traffic without its full production security hardening [s30].

Together AI's advice to customers with sensitive prompts is to turn ZDR on in their account settings [s33]. For its own leak the advice is right, since what went there was prompt samples it had stored for routine testing in a private Hugging Face repository [s14].

## The operator saw a server

Phala's monitoring caught unauthorized activity on one of its servers on November 5 [s28]. Whether anyone had read customer requests was a separate question, and the answer came from the outside researcher. Host monitoring answers "is this machine compromised", and it is good at that. It does not answer "was this customer's request read, and did someone use what was in it", and that second question is the one you have when you send prompts to somebody else's GPU.

The other providers had less to go on. None of the three in the Dragos report knew about its breach until Dragos told them, and the earliest incident went back to the middle of July [s25]. The report doesn't name them, so I can't tell you whether Phala is one of them. Together AI's scanner did catch its leaked credential and the commit was reverted [s16], yet the stored prompt samples were downloaded during that exposure window anyway [s32].

Since every breach in these reports surfaced through a canary, I can't use them to rank canaries against host monitoring. What they do show is that a canary answers the second question, and that you can ask it yourself without waiting for the provider.

## One fake key per request and per route

A planted key goes off because whoever holds stolen prompts goes through them looking for credentials and tries what turns up. The intruder at Together AI searched the downloaded samples and tested whether the credentials in them were valid [s32]. Five of them turned out to be canaries from a Dragos security experiment [s18]. With Dragos's own keys the attacker went straight to the same test, checking each one to see whether it was live, in some cases within a few hours of the request that carried it [s27].

One key per request also tells you where it leaked. In Dragos's largest breach, a couple hundred of its AWS keys were each sent in exactly one request to one provider, inside a few short windows in late October, and every request sent during those windows was stolen [s26].

They date a leak too, and as a customer that is the part I would want first. A researcher put a unique canary credential into each request to Phala from July 1 through November 7 and watched for later use [s11]. Only the canaries from requests sent on October 21 and 22 were misused afterwards [s12].

Dragos already gives the advice, to seed your own canaries in the context your agents and pipelines send and to treat any use of one as an incident [s5]. Agents send whatever they can read, credentials included [s4]. Together AI's own leak began with an AI coding agent that did exactly that, committing a credential that opened its private Hugging Face repository [s15]. I would keep real credentials out of anything an agent can read and leave the fake one there instead. What the advice leaves out is the record. A fake key is only worth planting if you can map it back to the request, the route and the time, and the route is the field that goes missing once a router picks the provider for you (which it will, the first afternoon your usual provider has a bad day). The minimum is a record written at the moment the request is built:

```python
from datetime import datetime, timezone

def plant_canary(request_id: str, route: str, ledger: list) -> str:
    # issue_decoy_key() stands for whatever decoy credential your alerting watches
    key = issue_decoy_key()
    ledger.append({
        "key": key,
        "request": request_id,
        "route": route,  # provider + model + region the router picked
        "sent_at": datetime.now(timezone.utc).isoformat(),
    })
    return key  # goes into the request context, nowhere else
```

This is a sketch and I have not run it. The hard parts are the ones the code cannot do for you. The decoy has to be something an attacker would bother testing, the alert has to reach a person, and the route has to be what the router actually chose, read from its response rather than from your config. If the router retries on a second provider after an error, write both routes down, because a key that leaked on the fallback looks exactly like one that leaked on the first choice. Expect a false positive of your own, too: your own agent finding the decoy in its context and trying it. The first alert may well come from inside the house.

OpenRouter's clean-up shows why the route has to be recorded on your side. It pulled 125 endpoints from ZDR eligibility [s22], some purely as a precaution [s35]. It is also turning the researchers' tests into a check it runs on an ongoing basis [s34]. Those are verdicts on providers in bulk. Whether one of those 125 endpoints served your agent last Tuesday is a question for the route column in your ledger.

Read a quiet canary narrowly. Phala keeps its wider precautionary window for user guidance, because the canary tests sampled requests and caught credential misuse without seeing every request or every data access [s31]. A canary that never fired means nobody used that particular key, which leaves the request next to it, and any attacker who reads prompts without trying a credential, unaccounted for. When a provider publishes an exposure window, treat every request you sent inside it as exposed, even if every one of your canaries stayed quiet.
