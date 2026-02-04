export interface GatingState {
  dateKey: string;
  freeSpreadUsed: boolean;
  clarifierUsedCount: number;
  anotherTopicUsedCount: number;
  lastAdTimestamp: number;
}

export interface GatingLimits {
  maxClarifierPerDay: number;
  maxAnotherTopicPerDay: number;
  adCooldownMs: number;
}

export const DEFAULT_GATING_LIMITS: GatingLimits = {
  maxClarifierPerDay: 1,
  maxAnotherTopicPerDay: 999,
  adCooldownMs: 2500,
};
