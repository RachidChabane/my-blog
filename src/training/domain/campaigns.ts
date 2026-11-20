/**
 * The campaigns the game offers: one per exam. Each is a content table, its domains
 * read from the exam definition in exam order and the boss mechanic of each domain;
 * the chapter story and art live in i18n/copy.ts, client/game/art.ts and sets.ts under
 * the same domain keys.
 */
import type { Campaign, CampaignSpec } from './campaign';
import { buildCampaign } from './campaign';
import type { Exam } from './exams';
import { DEVELOPER_PROFESSIONAL_EXAM, FOUNDATIONS_EXAM } from './exams';

const domainsOf = (exam: Exam) => exam.domains.map((d) => d.key);

export const FOUNDATIONS: CampaignSpec = {
  key: FOUNDATIONS_EXAM.key,
  domains: domainsOf(FOUNDATIONS_EXAM),
  bosses: {
    agentic_architecture: 'loop',
    tool_design_mcp: 'dispatcher',
    claude_code: 'allowall',
    prompt_engineering: 'offschema',
    context_management: 'leak',
  },
};

export const DEVELOPER_PROFESSIONAL: CampaignSpec = {
  key: DEVELOPER_PROFESSIONAL_EXAM.key,
  domains: domainsOf(DEVELOPER_PROFESSIONAL_EXAM),
  bosses: {
    integration_reliability: 'loop',
    agent_architecture: 'dispatcher',
    observability: 'dark',
    evaluation: 'overfit',
    guardrails_security: 'allowall',
    debugging_incidents: 'leak',
    fleet_operations: 'offschema',
    cost_latency: 'meter',
  },
};

export const CAMPAIGNS: readonly Campaign[] = [
  FOUNDATIONS,
  DEVELOPER_PROFESSIONAL,
].map(buildCampaign);

export function campaignOf(key: string): Campaign {
  const camp = CAMPAIGNS.find((c) => c.key === key);
  if (!camp) throw new Error(`no campaign ${key}`);
  return camp;
}

/** The campaign the first version of the game played: its saves migrate into it. */
export const LEGACY_CAMPAIGN: Campaign = campaignOf(FOUNDATIONS.key);
