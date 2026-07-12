import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (login, signup).
 * Prevents brute-force attacks by limiting to 5 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: false,
});

/**
 * General API rate limiter.
 * Prevents abuse and DDoS on all other API endpoints.
 * Limit: 100 requests per 15 minutes per IP.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please slow down and try again later.',
  },
});
