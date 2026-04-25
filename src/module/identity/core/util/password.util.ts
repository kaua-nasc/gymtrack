import type { ScryptOptions } from 'node:crypto';
import {
  scrypt as nodeScrypt,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const HASH_PREFIX = 'scrypt';
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const DEFAULT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const scryptAsync = (
  password: string,
  salt: string,
  keyLength: number,
  options: ScryptOptions
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey as Buffer);
    });
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString('base64url');
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
  });

  return `${HASH_PREFIX}$${DEFAULT_N}$${DEFAULT_R}$${DEFAULT_P}$${salt}$${derivedKey.toString('base64url')}`;
};

export const hashPasswordSync = (password: string): string => {
  const salt = randomBytes(SALT_LENGTH).toString('base64url');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
  });

  return `${HASH_PREFIX}$${DEFAULT_N}$${DEFAULT_R}$${DEFAULT_P}$${salt}$${derivedKey.toString('base64url')}`;
};

export const verifyPassword = async (
  plainPassword: string,
  storedPasswordHash: string
): Promise<boolean> => {
  const [prefix, nText, rText, pText, salt, hashText] = storedPasswordHash.split('$');

  if (prefix !== HASH_PREFIX || !nText || !rText || !pText || !salt || !hashText) {
    return false;
  }

  const N = Number(nText);
  const r = Number(rText);
  const p = Number(pText);

  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }

  const expectedHash = Buffer.from(hashText, 'base64url');
  const derivedHash = await scryptAsync(plainPassword, salt, expectedHash.length, {
    N,
    r,
    p,
  });

  if (derivedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, expectedHash);
};
