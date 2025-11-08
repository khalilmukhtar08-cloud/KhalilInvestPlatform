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
