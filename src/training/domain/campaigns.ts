/**
 * The campaigns the game offers: one per certification. Each is a content table, its
 * domains read from the exam file in exam order and the boss mechanic of each domain;
 * the chapter story and art live in i18n/copy.ts and client/game/art.ts under the same
 * domain keys.
 */
import exam from '../data/exam.json';
import type { Campaign, CampaignSpec } from './campaign';
import { buildCampaign } from './campaign';

export const FOUNDATIONS: CampaignSpec = {
  key: exam.code,
  domains: exam.domains.map((d) => d.key),
  bosses: {
    agentic_architecture: 'loop',
    tool_design_mcp: 'dispatcher',
    claude_code: 'allowall',
    prompt_engineering: 'offschema',
    context_management: 'leak',
  },
};

export const CAMPAIGNS: readonly Campaign[] = [buildCampaign(FOUNDATIONS)];

/** The campaign the first version of the game played: its saves migrate into it. */
export const LEGACY_CAMPAIGN: Campaign = CAMPAIGNS[0];

export const campaignOf = (key: string): Campaign =>
  CAMPAIGNS.find((c) => c.key === key) ?? CAMPAIGNS[0];
