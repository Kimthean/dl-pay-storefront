
'use server'
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Encryption/Decryption Specification:
// - Algorithm: AES-256-GCM
// - Key Format: Hex encoded 256-bit key (64 hex chars)
// - IV: 12 random bytes (96 bits)
// - Authentication Tag: 16 bytes (128 bits)
// - Output Format: base64(IV + ciphertext + authTag)

/**
 * Encrypts a payload using AES-256-GCM encryption
 * @param payload - The data object to encrypt
 * @param secretKey - 64-character hex string (256-bit key)
 * @returns base64 encoded string containing IV, ciphertext, and auth tag concatenated together
 * @throws Will throw if key is invalid or encryption fails
 */
export async function encryptPayload(payload: object, secretKey: string) {
  // Generate 12-byte initialization vector (96 bits for AES-GCM)
  const iv = randomBytes(12);

  // Create cipher with AES-256-GCM algorithm
  const cipher = createCipheriv(
    "aes-256-gcm",
    Buffer.from(secretKey, "hex"), // Convert hex key to binary
    iv,
  );

  // Encrypt the payload: Convert object to JSON string, then encrypt
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"), // Stream processing
    cipher.final(), // Finalize encryption
  ]);

  // Get authentication tag (16 bytes for GCM)
  const tag = cipher.getAuthTag();

  // Combine IV + ciphertext + authTag and return as base64
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

/**
 * Decrypts a payload encrypted with encryptPayload
 * @param encrypted - base64 string containing IV, ciphertext, and auth tag
 * @param secretKey - 64-character hex string (must match key used for encryption)
 * @returns The original decrypted object
 * @throws Will throw if decryption fails (invalid key, corrupted data, or authentication failure)
 */
export async function decryptPayload(encrypted: string, secretKey: string) {
  // Decode base64 and split into components
  const buffer = Buffer.from(encrypted, "base64");
  const iv = buffer.subarray(0, 12); // First 12 bytes: IV
  const ciphertext = buffer.subarray(12, -16); // Middle bytes: ciphertext
  const tag = buffer.subarray(-16); // Last 16 bytes: auth tag

  // Create decipher and set authentication tag
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(secretKey, "hex"),
    iv,
  ).setAuthTag(tag); // Critical for authentication check

  // Decrypt and parse original JSON
  return JSON.parse(
    Buffer.concat([
      decipher.update(ciphertext), // Process ciphertext
      decipher.final(), // Finalize decryption
    ]).toString(),
  );
}