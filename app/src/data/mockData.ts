import { Beneficiary, FollowUp, Visit } from '@asha/shared';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_FOLLOWUPS, SYNTHETIC_VISITS } from './seed';

/**
 * Single source of truth for mock & synthetic data across all screens and tests.
 * All records strictly use canonical English names and codes, which are then
 * dynamically localized to any of the 7 supported Indic languages at display time.
 */
export const MOCK_BENEFICIARIES: Beneficiary[] = SYNTHETIC_BENEFICIARIES;
export const MOCK_FOLLOWUPS: FollowUp[] = SYNTHETIC_FOLLOWUPS;
export const MOCK_VISITS: Visit[] = SYNTHETIC_VISITS;
