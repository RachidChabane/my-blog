#!/usr/bin/env bash
# Provision the avatar RAG's Cloudflare resources (M-1). Run ONCE from the repo root
# after the token is rotated; re-running is safe (create steps no-op if they exist).
#
# Needs:
#   - CLOUDFLARE_API_TOKEN  (Account · Vectorize:Edit + D1:Edit + Workers AI:Read)
#   - CLOUDFLARE_ACCOUNT_ID
#   - npx wrangler on PATH (4.x)
#
#   export CLOUDFLARE_API_TOKEN=...  CLOUDFLARE_ACCOUNT_ID=...
#   bash scripts/cf-provision.sh
#
# After `wrangler d1 create` prints the database_id, paste it into wrangler.toml
# ([[d1_databases]].database_id) and commit that one line — then deploy (DEPLOY.md §3).
set -euo pipefail

INDEX_NAME="my-blog-avatar" # MUST match wrangler.toml [[vectorize]].index_name
DB_NAME="my-blog-avatar"    # MUST match wrangler.toml [[d1_databases]].database_name
SCHEMA="scripts/avatar-d1-schema.sql"

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN (rotated token, see DEPLOY.md O1)}"
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"

echo "==> Vectorize index '$INDEX_NAME' (1024-dim, cosine — matches bge-m3)"
npx wrangler vectorize create "$INDEX_NAME" --dimensions=1024 --metric=cosine \
  || echo "    (vectorize create failed — already exists? continuing)"

echo "==> D1 database '$DB_NAME'"
npx wrangler d1 create "$DB_NAME" \
  || echo "    (d1 create failed — already exists? continuing)"

echo "==> Loading schema '$SCHEMA' into the REMOTE D1 database"
npx wrangler d1 execute "$DB_NAME" --remote --file "$SCHEMA" --yes

echo
echo "DONE."
echo "  -> Paste the database_id printed by 'wrangler d1 create' above into"
echo "     wrangler.toml ([[d1_databases]].database_id), commit it, then:"
echo "     EMBEDDINGS_API_KEY=\$CLOUDFLARE_API_TOKEN pnpm build:index   # seed the index"
echo "     pnpm build && npx wrangler pages deploy dist --project-name=my-blog --branch=main"
