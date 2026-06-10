# Domain migration — rachid-chabane.com → Cloudflare (for the Pages site)

Goal: serve the live site at `https://rachid-chabane.com` instead of `my-blog-4uk.pages.dev`.
Cloudflare Pages can only attach an **apex** custom domain when the domain's DNS is hosted on
Cloudflare — so the one manual piece is moving DNS authority from IONOS to Cloudflare. The domain
stays **registered** at IONOS (this is Cloudflare "Full setup" / nameserver delegation, **not** a
registrar transfer).

Menus below are from the **current** (verified 2026-06-09) official IONOS + Cloudflare docs.

## No downtime — read this first
- `my-blog-4uk.pages.dev` keeps serving the **entire** time. Nothing about the site goes offline.
- The apex `rachid-chabane.com` simply isn't pointed at the site **until** the last step; worst case
  it keeps showing the IONOS parking page a little longer. There is no "dead" window.
- **Your email is preserved** as long as we recreate the 4 IONOS mail records in Cloudflare (below),
  which we do *before* flipping the nameservers.

## Your current DNS (what must carry over vs. what's dropped)
| Record | Current value | Action |
|---|---|---|
| apex `A` / `AAAA` | `217.160.0.141` / `2001:8d8:100f:f000::200` (IONOS parking) | **DROP** — Pages creates the apex record itself |
| `MX` | `mx00.ionos.fr`, `mx01.ionos.fr` (pri 10) | **KEEP** — recreate, DNS-only |
| `TXT` (SPF) | `v=spf1 include:_spf-eu.ionos.com ~all` | **KEEP** — recreate, DNS-only |
| `_dmarc` | CNAME → `dmarc.ionos.fr` | **KEEP** — recreate, DNS-only |
| `autodiscover` | CNAME → `adsredir.ionos.info` | **KEEP** — recreate, DNS-only (Outlook autoconfig) |
| `www` | (none) | nothing to do (optional later: redirect www → apex) |
| DNSSEC | not active | nothing to do ✅ |

---

## Step 1 — YOU: add the domain to Cloudflare
1. Log in at **dash.cloudflare.com**.
2. Left nav → **Domains** → click **Onboard a domain**.
   *(This is the renamed "Add a site" flow — the button is now "Onboard a domain" inside the
   "Domains" section. Don't use the separate "Domains" tab inside Workers & Pages.)*
3. Enter the bare apex **`rachid-chabane.com`** (no `www`, no `https://`) → **Continue**.
4. On the plan screen pick the **Free** plan ($0/mo — it's usually at the **bottom**, under Pro/
   Business/Enterprise) → **Continue**.
5. Cloudflare runs a quick scan and shows the records it found. **Don't worry about getting these
   perfect** — just click through. (The scan "is not guaranteed to find all records," so I'll
   reconcile them in Step 2.)
6. Cloudflare shows your **two assigned nameservers** (like `xxx.ns.cloudflare.com`). Leave the tab
   open. **→ Tell me "zone added"** (and the 2 nameservers, or just that the zone exists).

## Step 2 — ME: reconcile DNS records + hand you the nameservers
Once the zone exists I'll (via the API token you provided):
- Recreate/verify the 4 mail records exactly (`MX`, SPF `TXT`, `_dmarc`, `autodiscover`), all set to
  **DNS only** (grey cloud) — Cloudflare forces MX/TXT to DNS-only anyway; the `autodiscover` CNAME
  is the one that must be **grey** by hand or Outlook autoconfig breaks.
- **Remove the apex `A`/`AAAA`** (the IONOS parking IPs) so Pages can own the apex.
- Read back the two Cloudflare nameservers and give them to you for Step 3.

*(If the token can't edit the new zone, I'll instead hand you the exact record list to paste — same
outcome, slightly more clicks for you.)*

## Step 3 — YOU: point the nameservers at Cloudflare (at IONOS)
1. Log in at **my.ionos.com** → top **Menu** → **Domains & SSL**.
2. In the domain list, find **rachid-chabane.com** → click the **gear (⚙) icon** in the **Actions**
   column. **Pick "Name Server"** from that menu — **not** "DNS" (DNS only edits records and keeps
   IONOS's nameservers).
3. Click **"Use Custom Name Servers"** *(some accounts word it "Use other name servers")*.
4. Put Cloudflare's two nameservers into **Name Server 1** and **Name Server 2**. Leave **3** and
   **4** blank (two is enough). **Copy them exactly** — a single typo and DNS won't resolve.
5. **Save**. *(No DNSSEC step — yours is off. "Reset Settings" reverts to IONOS if ever needed.)*
6. **→ Tell me "nameservers changed."** Propagation is usually minutes, up to ~24–48h worst case.

## Step 4 — ME: activate + attach the site + switch the canonical URL
- Watch the Cloudflare zone flip **Pending → Active** (I'll use the "Check nameservers" button).
- In **Workers & Pages → my-blog → Custom domains → Set up a domain**, add `rachid-chabane.com`.
  Cloudflare auto-creates the apex record (CNAME flattening) and issues the TLS cert (15 min–24 h).
  *(I will NOT pre-create that record by hand — doing so causes a 522.)*
- Flip `SITE_URL` → `https://rachid-chabane.com` everywhere (rebuild + reseed the avatar index so
  citations use the real domain + update the GH/Pages secrets), then verify the apex serves the
  site over HTTPS **and** that mail still resolves (MX/SPF intact).

---

### Gotchas (all from current official docs)
- **Copy the 2 nameservers character-for-character** — Cloudflare: "If their names are not copied
  exactly, your DNS will not resolve correctly."
- **Mail records stay DNS-only (grey cloud).** MX/TXT can't be proxied; the `autodiscover` CNAME
  *can* be proxied but must not be.
- **Apex can't have both** an `A`/`AAAA` and the Pages CNAME — that's why we drop the parking IPs.
- **Cert stalls?** Only if a restrictive `CAA` record blocks Cloudflare's CAs — you have none, so
  this shouldn't bite; Cloudflare adds the needed CAA itself when it's your DNS.
