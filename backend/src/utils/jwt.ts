import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Force a hard crash at startup if the secret is not configured.
// A missing secret would allow tokens to be signed with an empty string — a critical vulnerability.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    '[FATAL] JWT_SECRET environment variable is not set or is too short (min 32 chars). Server cannot start.'
  );
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload as object, JWT_SECRET, options);
};

export const signRefreshToken = (payload: Pick<JwtPayload, 'id'>): string => {
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload as object, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
