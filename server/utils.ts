import crypto from "crypto";

export function generateReferralCode(name: string): string {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  const namePart = name
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();
  
  return `${namePart}${randomPart}`;
}

export function generateAffiliateCode(name: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const namePart = name
    .replace(/\s+/g, "")
    .substring(0, 3)
    .toUpperCase();
  
  return `${namePart}-${timestamp}`;
}

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}
