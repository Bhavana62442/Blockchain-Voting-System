import CryptoJS from 'crypto-js';

export function generateChameleonHash(vote, salt = null) {
  const randomSalt = salt || Math.random().toString(36).substring(2, 10);
  const hash = CryptoJS.SHA256(vote + randomSalt).toString();
  return { hash, salt: randomSalt };
}
