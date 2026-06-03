import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CheckResult {
  name: string;
  pass: boolean;
  message: string;
}

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');

function readFile(rel: string): string {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) return '';
  return readFileSync(abs, 'utf8');
}

function fileExists(rel: string): boolean {
  return existsSync(join(ROOT, rel));
}

// ── Check 1 ──────────────────────────────────────────────────────────────────

export function checkRedTeamSuite(): CheckResult {
  const name = 'Avatar red-team suite';
  const path = 'tests/avatar-redteam.test.ts';

  if (!fileExists(path)) {
    return { name, pass: false, message: `${path} not found` };
  }

  const src = readFile(path);

  const groups = [
    'RT-A',
    'RT-B',
    'RT-C',
    'RT-D',
    'RT-E',
    'RT-F',
    'RT-G',
    'RT-H',
  ];
  for (const g of groups) {
    if (!src.includes(`'${g}`)) {
      return {
        name,
        pass: false,
        message: `missing test group descriptor '${g}'`,
      };
    }
  }

  for (const label of ['[TEETH]', '[LOCK]']) {
    if (!src.includes(label)) {
      return { name, pass: false, message: `missing label ${label}` };
    }
  }

  for (const sym of ['FENCE_SENTINELS', 'neutralizeUntrusted']) {
    if (!src.includes(sym)) {
      return { name, pass: false, message: `missing import/usage: ${sym}` };
    }
  }

  return {
    name,
    pass: true,
    message: 'RT-A through RT-H present, TEETH + LOCK labels confirmed',
  };
}

// ── Check 2 ──────────────────────────────────────────────────────────────────

export function checkPerLanguageQualityGates(): CheckResult {
  const name = 'Per-language quality gates';

  const gateFiles = [
    'pipeline/gate/factcheck.py',
    'pipeline/gate/style.py',
    'pipeline/gate/grounding.py',
    'pipeline/gate/fallback.py',
  ];

  for (const f of gateFiles) {
    if (!fileExists(f)) {
      return { name, pass: false, message: `${f} not found` };
    }
  }

  const factcheck = readFile('pipeline/gate/factcheck.py');
  if (!factcheck.includes('factcheck-{lang}')) {
    return {
      name,
      pass: false,
      message: 'pipeline/gate/factcheck.py missing factcheck-{lang} naming',
    };
  }

  const testGate = readFile('pipeline/tests/test_gate.py');
  for (const gate of ['"factcheck-fr"', '"factcheck-en"']) {
    if (!testGate.includes(gate)) {
      return {
        name,
        pass: false,
        message: `pipeline/tests/test_gate.py missing ${gate}`,
      };
    }
  }

  const invariants = readFile('pipeline/invariants.yaml');
  const requiredGates = [
    'factcheck-fr',
    'factcheck-en',
    'grounding-fr',
    'grounding-en',
    'style-fr',
    'style-en',
  ];
  for (const g of requiredGates) {
    if (!invariants.includes(g)) {
      return {
        name,
        pass: false,
        message: `pipeline/invariants.yaml missing gate: ${g}`,
      };
    }
  }

  return {
    name,
    pass: true,
    message: '4 gate modules + 6 pipeline/invariants.yaml entries',
  };
}

// ── Check 3 ──────────────────────────────────────────────────────────────────

export const SECRET_PATTERN =
  /(-----BEGIN [A-Z ]+PRIVATE KEY-----|sk-ant-api\d{2}-[A-Za-z0-9_-]{20}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10})/;

export function testSecretPattern(content: string): RegExpMatchArray | null {
  return content.match(SECRET_PATTERN);
}

function collectFiles(dir: string, acc: string[]): void {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.git' || entry === '__pycache__')
      continue;
    // Only skip hidden dirs that are NOT .github
    if (entry.startsWith('.') && entry !== '.github') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectFiles(full, acc);
    } else {
      // Skip .example files
      if (!entry.endsWith('.example')) {
        acc.push(full);
      }
    }
  }
}

export function checkSecretScan(): CheckResult {
  const name = 'Secret scan';

  const scanDirs = [
    'src',
    'functions',
    'pipeline',
    'scripts',
    'public',
    '.github',
  ];
  const scanFiles = ['astro.config.mjs', 'wrangler.toml', 'package.json'];

  const allFiles: string[] = [];

  for (const d of scanDirs) {
    collectFiles(join(ROOT, d), allFiles);
  }
  for (const f of scanFiles) {
    const abs = join(ROOT, f);
    if (existsSync(abs)) allFiles.push(abs);
  }

  const hits: string[] = [];
  for (const abs of allFiles) {
    try {
      const content = readFileSync(abs, 'utf8');
      if (SECRET_PATTERN.test(content)) {
        hits.push(abs.replace(ROOT + '/', ''));
      }
    } catch {
      // binary or unreadable — skip
    }
  }

  if (hits.length > 0) {
    return {
      name,
      pass: false,
      message: `Forbidden pattern found in: ${hits.join(', ')}`,
    };
  }

  return {
    name,
    pass: true,
    message: 'No forbidden patterns in tracked source files',
  };
}

// ── Check 4 ──────────────────────────────────────────────────────────────────

export function checkPerfA11yBudgets(): CheckResult {
  const name = 'Perf/a11y budgets';

  if (!fileExists('e2e/perf.spec.ts')) {
    return { name, pass: false, message: 'e2e/perf.spec.ts not found' };
  }

  const perf = readFile('e2e/perf.spec.ts');
  for (const s of [
    'LCP',
    'SCRIPT_COUNT_BUDGET',
    "test.describe('perf budgets",
  ]) {
    if (!perf.includes(s)) {
      return { name, pass: false, message: `e2e/perf.spec.ts missing: ${s}` };
    }
  }

  if (!fileExists('e2e/a11y.spec.ts')) {
    return { name, pass: false, message: 'e2e/a11y.spec.ts not found' };
  }

  const a11y = readFile('e2e/a11y.spec.ts');
  for (const s of [
    'AxeBuilder',
    'structuralScan',
    'contrastScan',
    'KNOWN_AA_DEFECTS',
  ]) {
    if (!a11y.includes(s)) {
      return { name, pass: false, message: `e2e/a11y.spec.ts missing: ${s}` };
    }
  }

  if (!fileExists('e2e/helpers/axe.ts')) {
    return { name, pass: false, message: 'e2e/helpers/axe.ts not found' };
  }

  if (!fileExists('e2e/full-site.spec.ts')) {
    return { name, pass: false, message: 'e2e/full-site.spec.ts not found' };
  }

  return {
    name,
    pass: true,
    message: 'e2e/perf.spec.ts + e2e/a11y.spec.ts + helpers/axe.ts present',
  };
}

// ── Check 5 ──────────────────────────────────────────────────────────────────

export function validateWranglerText(text: string): string[] {
  const errors: string[] = [];
  if (!text.includes('pages_build_output_dir = "dist"')) {
    errors.push('missing pages_build_output_dir = "dist"');
  }
  if (!text.includes('compatibility_date')) {
    errors.push('missing compatibility_date');
  }
  if (!text.includes('name = "my-blog"')) {
    errors.push('missing name = "my-blog"');
  }
  return errors;
}

export function checkCloudflareConfig(): CheckResult {
  const name = 'Cloudflare deploy config';

  if (!fileExists('wrangler.toml')) {
    return { name, pass: false, message: 'wrangler.toml not found' };
  }

  const wrangler = readFile('wrangler.toml');
  const wranglerErrors = validateWranglerText(wrangler);
  if (wranglerErrors.length > 0) {
    return {
      name,
      pass: false,
      message: `wrangler.toml: ${wranglerErrors.join('; ')}`,
    };
  }

  if (!fileExists('astro.config.mjs')) {
    return { name, pass: false, message: 'astro.config.mjs not found' };
  }

  const astroConfig = readFile('astro.config.mjs');
  if (!astroConfig.includes("output: 'static'")) {
    return {
      name,
      pass: false,
      message: "astro.config.mjs missing output: 'static'",
    };
  }

  const pkg = readFile('package.json');
  if (!pkg.includes('"build": "astro build && pagefind --site dist"')) {
    return {
      name,
      pass: false,
      message: 'package.json build script does not match expected command',
    };
  }

  if (!fileExists('.env.example')) {
    return { name, pass: false, message: '.env.example not found' };
  }

  const envExample = readFile('.env.example');
  const requiredVars = [
    'OPENROUTER_API_KEY',
    'EMBEDDINGS_API_KEY',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'SITE_URL',
  ];
  for (const v of requiredVars) {
    if (!envExample.includes(v)) {
      return { name, pass: false, message: `.env.example missing: ${v}` };
    }
  }

  return {
    name,
    pass: true,
    message: 'wrangler.toml, astro.config.mjs, .env.example all valid',
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const checks = await Promise.all([
    checkRedTeamSuite(),
    checkPerLanguageQualityGates(),
    checkSecretScan(),
    checkPerfA11yBudgets(),
    checkCloudflareConfig(),
  ]);

  console.log('# Launch readiness\n');
  console.log('| Check | Status | Detail |');
  console.log('|-------|--------|--------|');
  for (const c of checks) {
    const icon = c.pass ? 'PASS' : 'FAIL';
    console.log(`| ${c.name} | ${icon} | ${c.message} |`);
  }

  const allPass = checks.every((c) => c.pass);
  console.log(
    `\n${allPass ? 'All checks passed.' : 'One or more checks FAILED.'}`
  );
  process.exit(allPass ? 0 : 1);
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? '')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
