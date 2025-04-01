// Rate limiter service for tracking R2 API calls
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const RATE_LIMIT = 10; // Maximum number of calls allowed
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory store for rate limiting
const rateLimits = new Map<string, RateLimitInfo>();

export async function checkRateLimit(headers: Record<string, string | string[] | undefined>): Promise<boolean> {
  try {
    // Get the authenticated user session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    // If no session, return false
    if (!session || !session.user) {
      return false;
    }

    const userId = session.user.id;
    const now = Date.now();

    // Get or initialize rate limit info for the user
    let rateLimitInfo = rateLimits.get(userId);

    if (!rateLimitInfo) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + RESET_INTERVAL,
      };
      rateLimits.set(userId, rateLimitInfo);
    }

    // Check if we need to reset the counter
    if (now >= rateLimitInfo.resetTime) {
      rateLimitInfo.count = 0;
      rateLimitInfo.resetTime = now + RESET_INTERVAL;
    }

    // Check if user has exceeded the rate limit
    if (rateLimitInfo.count >= RATE_LIMIT) {
      return false;
    }

    // Increment the counter
    rateLimitInfo.count++;
    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return false;
  }
}

export function getRemainingCalls(headers: Record<string, string | string[] | undefined>): Promise<number> {
  return new Promise(async (resolve) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });

      if (!session || !session.user) {
        resolve(0);
        return;
      }

      const userId = session.user.id;
      const rateLimitInfo = rateLimits.get(userId);

      if (!rateLimitInfo) {
        resolve(RATE_LIMIT);
        return;
      }

      const now = Date.now();
      if (now >= rateLimitInfo.resetTime) {
        resolve(RATE_LIMIT);
        return;
      }

      resolve(Math.max(0, RATE_LIMIT - rateLimitInfo.count));
    } catch (error) {
      console.error('Error getting remaining calls:', error);
      resolve(0);
    }
  });
} 