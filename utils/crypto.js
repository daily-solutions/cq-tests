import CryptoJS from 'crypto-js';

export const crypt = (salt, text) => {
  const encrypted = CryptoJS.AES.encrypt(text, salt);
  return encrypted.toString();
};

export const decrypt = (salt, encoded) => {
  const decrypted = CryptoJS.AES.decrypt(encoded, salt);
  return decrypted.toString(CryptoJS.enc.Utf8);
};
