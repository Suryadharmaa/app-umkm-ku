import * as Crypto from "expo-crypto";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { bytesToHex, hexToBytes } from "@noble/ciphers/utils.js";
import { scryptAsync } from "@noble/hashes/scrypt.js";

import type { BusinessState } from "./business-store";

const BACKUP_FORMAT = "umkm-ku.backup";
const BACKUP_VERSION = 1;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type BackupHeader = { createdAt: string; transactionCount: number; businessName: string };
type BackupPayload = { format: typeof BACKUP_FORMAT; version: typeof BACKUP_VERSION; createdAt: string; data: BusinessState };
type BackupEnvelope = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  cipher: "XChaCha20-Poly1305";
  kdf: { name: "scrypt"; N: number; r: number; p: number; salt: string };
  nonce: string;
  ciphertext: string;
  summary: { transactionCount: number; businessName: string };
};

const KDF = { N: 2 ** 13, r: 8, p: 1, dkLen: 32, maxmem: 32 * 1024 * 1024, asyncTick: 1 };

function assertPassphrase(passphrase: string) {
  if (passphrase.trim().length < 8) throw new Error("Gunakan kata sandi minimal 8 karakter untuk melindungi backup.");
}

async function deriveKey(passphrase: string, salt: string) {
  return scryptAsync(passphrase, salt, KDF);
}

function parseEnvelope(serialized: string): BackupEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error("Berkas backup bukan format JSON yang valid.");
  }
  const envelope = parsed as Partial<BackupEnvelope>;
  if (envelope.format !== BACKUP_FORMAT || envelope.version !== BACKUP_VERSION || envelope.cipher !== "XChaCha20-Poly1305" || !envelope.kdf || envelope.kdf.name !== "scrypt" || typeof envelope.kdf.salt !== "string" || typeof envelope.nonce !== "string" || typeof envelope.ciphertext !== "string" || typeof envelope.createdAt !== "string" || !envelope.summary || typeof envelope.summary.transactionCount !== "number" || typeof envelope.summary.businessName !== "string") {
    throw new Error("Format backup UMKM KU tidak didukung atau tidak lengkap.");
  }
  return envelope as BackupEnvelope;
}

/** Creates a password-protected, authenticated portable JSON backup. */
export async function createEncryptedBusinessBackup(data: BusinessState, passphrase: string) {
  assertPassphrase(passphrase);
  const createdAt = new Date().toISOString();
  const payload: BackupPayload = { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt, data };
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const nonce = bytesToHex(await Crypto.getRandomBytesAsync(24));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = xchacha20poly1305(key, hexToBytes(nonce)).encrypt(encoder.encode(JSON.stringify(payload)));
  const envelope: BackupEnvelope = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt,
    cipher: "XChaCha20-Poly1305",
    kdf: { name: "scrypt", N: KDF.N, r: KDF.r, p: KDF.p, salt },
    nonce,
    ciphertext: bytesToHex(ciphertext),
    summary: { transactionCount: data.transactions.length, businessName: data.profile.businessName },
  };
  return { serialized: JSON.stringify(envelope), header: envelope.summary, createdAt };
}

export function inspectEncryptedBusinessBackup(serialized: string): BackupHeader {
  const envelope = parseEnvelope(serialized);
  return { createdAt: envelope.createdAt, ...envelope.summary };
}

/** Decrypts and verifies the authenticated backup before any state is restored. */
export async function decryptEncryptedBusinessBackup(serialized: string, passphrase: string) {
  assertPassphrase(passphrase);
  const envelope = parseEnvelope(serialized);
  try {
    const key = await deriveKey(passphrase, envelope.kdf.salt);
    const plaintext = xchacha20poly1305(key, hexToBytes(envelope.nonce)).decrypt(hexToBytes(envelope.ciphertext));
    const payload = JSON.parse(decoder.decode(plaintext)) as Partial<BackupPayload>;
    if (payload.format !== BACKUP_FORMAT || payload.version !== BACKUP_VERSION || !payload.data || !Array.isArray(payload.data.transactions)) {
      throw new Error("Isi backup tidak sesuai dengan struktur data UMKM KU.");
    }
    return { data: payload.data, header: { createdAt: envelope.createdAt, ...envelope.summary } };
  } catch (error) {
    if (error instanceof Error && error.message.includes("struktur data")) throw error;
    throw new Error("Kata sandi salah atau berkas backup telah berubah.");
  }
}

export function backupFilename(createdAt = new Date()) {
  const stamp = createdAt.toISOString().slice(0, 10);
  return `umkm-ku-backup-${stamp}.umkmku`;
}
