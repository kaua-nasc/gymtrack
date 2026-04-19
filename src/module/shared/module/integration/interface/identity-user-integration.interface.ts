export interface IdentityUser {
  id: string;
  isVerified?: boolean;
  [key: string]: unknown;
}
