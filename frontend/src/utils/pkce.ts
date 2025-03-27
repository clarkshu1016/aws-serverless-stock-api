import { SHA256 } from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';

// Generate a random code verifier
export function generateCodeVerifier(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  randomValues.forEach(v => {
    result += charset[v % charset.length];
  });
  return result;
}

// Generate code challenge using SHA-256 hash
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Hash the code verifier with SHA-256
  const hashDigest = SHA256(codeVerifier);
  
  // Base64 encode the hash digest
  let base64 = Base64.stringify(hashDigest);
  
  // Make it URL safe
  let base64Url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64Url;
}
