import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // private key = CryptoJS.SHA256('restoremanagementkey').toString(); // Match C# key generation
  // private iv = CryptoJS.enc.Utf8.parse(this.generateIV('restoremanage')); // Match C# IV generation

  // /**
  //  * Encrypts the given plaintext using AES.
  //  * @param text The plaintext to encrypt.
  //  * @returns Encrypted string in Base64 format.
  //  */
  // encrypt(text: string): string {
  //   const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(this.key), {
  //     iv: this.iv,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });
  //   return encrypted.toString();
  // }

  // /**
  //  * Decrypts the given ciphertext using AES.
  //  * @param cipherText The Base64 encoded ciphertext to decrypt.
  //  * @returns The decrypted plaintext.
  //  */
  // decrypt(cipherText: string): string {
  //   const decrypted = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(this.key), {
  //     iv: this.iv,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });
  //   return decrypted.toString(CryptoJS.enc.Utf8);
  // }

  // /**
  //  * Generate a 16-byte IV from a given string.
  //  * @param ivString The string to generate the IV from.
  //  * @returns A 16-byte IV string.
  //  */
  // private generateIV(ivString: string): string {
  //   const ivBytes = CryptoJS.enc.Utf8.parse(ivString);
  //   const ivFinal = new Uint8Array(16); // AES IV size is 16 bytes
  //   for (let i = 0; i < ivBytes.sigBytes; i++) {
  //     if (i < 16) {
  //       ivFinal[i] = ivBytes.words[i >>> 2] >>> (24 - (i % 4) * 8);
  //     }
  //   }
  //   return CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.create(ivFinal));
  // }







    // Generate a 32-byte (256-bit) key using SHA-256
    private generateKey(key: string): CryptoJS.lib.WordArray {
      return CryptoJS.SHA256(key);
    }
  
    // Generate a 16-byte (128-bit) IV
    private generateIV(iv: string): CryptoJS.lib.WordArray {
      const ivBytes = CryptoJS.enc.Utf8.parse(iv);
      const ivFinal = ivBytes.clone();
      ivFinal.sigBytes = 16;  // Ensure the IV is exactly 16 bytes
      return ivFinal;
    }
  
    // Create key and IV based on provided values
    private key = this.generateKey('restoremanagementkey');
    private iv = this.generateIV('restoremanage');
  
    /**
     * Encrypts the given text using AES with CBC mode and PKCS7 padding.
     * @param text The plaintext to encrypt.
     * @returns The encrypted string in Base64 format.
     */
    encrypt(text: string): string {
      const encrypted = CryptoJS.AES.encrypt(text, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
  
      return encrypted.toString();  // Return encrypted text as Base64
    }
  
    /**
     * Decrypts the given Base64 encoded ciphertext using AES.
     * @param cipherText The Base64 encoded ciphertext.
     * @returns The decrypted plaintext string.
     */
    decrypt(cipherText: string): string {
      const decrypted = CryptoJS.AES.decrypt(cipherText, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
  
      return decrypted.toString(CryptoJS.enc.Utf8); // Return decrypted text as UTF-8 string
    }
}
