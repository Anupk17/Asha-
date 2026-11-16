export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxPerMinute: number;

  constructor(maxPerMinute: number = 120) {
    this.maxPerMinute = maxPerMinute;
  }

  public check(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000;

    let timestamps = this.requests.get(userId) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxPerMinute) {
      this.requests.set(userId, timestamps);
      return false; // Rate limit exceeded
    }

    timestamps.push(now);
    this.requests.set(userId, timestamps);
    return true;
  }

  public reset(userId: string): void {
    this.requests.delete(userId);
  }
}

export const userRateLimiter = new RateLimiter(120);

