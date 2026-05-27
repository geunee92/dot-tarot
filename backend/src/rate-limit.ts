export interface Env {
  RATE_LIMIT: KVNamespace;
}

/** Max interpretation requests allowed per IP per day (resets at UTC midnight). */
export const DAILY_LIMIT = 30;

interface RateLimitData {
  count: number;
  resetAt: number;
}

export async function checkRateLimit(
  env: Env,
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate-limit:${ip}`;
  const data = await env.RATE_LIMIT.get(key, 'json');

  const now = Date.now();

  if (!data) {
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  const rateLimitData = data as RateLimitData;

  if (now > rateLimitData.resetAt) {
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  const remaining = Math.max(0, DAILY_LIMIT - rateLimitData.count);
  return { allowed: remaining > 0, remaining };
}

export async function incrementRateLimit(env: Env, ip: string): Promise<void> {
  const key = `rate-limit:${ip}`;
  const data = await env.RATE_LIMIT.get(key, 'json');

  const now = Date.now();
  const midnightUTC = new Date(now);
  midnightUTC.setUTCHours(24, 0, 0, 0);
  const resetAt = midnightUTC.getTime();

  if (!data) {
    const newData: RateLimitData = { count: 1, resetAt };
    await env.RATE_LIMIT.put(key, JSON.stringify(newData));
    return;
  }

  const rateLimitData = data as RateLimitData;

  if (now > rateLimitData.resetAt) {
    const newData: RateLimitData = { count: 1, resetAt };
    await env.RATE_LIMIT.put(key, JSON.stringify(newData));
  } else {
    rateLimitData.count += 1;
    await env.RATE_LIMIT.put(key, JSON.stringify(rateLimitData));
  }
}
