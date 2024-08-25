import crypto from "crypto";

/**
 * Encrypts a given text.
 *
 * @param text text to encrypt
 *
 * @returns encrypted text
 */
const encrypt = (text: string): string => {
  const algorithm = "aes-256-cbc";
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY as string;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key, "base64"),
    iv,
  );
  let encrypted = cipher.update(text, "utf-8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

/**
 * Decrypts a given text.
 *
 * @param text text to decrypt
 *
 * @returns decrypted text
 */
const decrypt = (text: string): string => {
  const algorithm = "aes-256-cbc";
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY as string;

  const parts = text.split(":");
  const iv = Buffer.from(parts.shift() as string, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, "base64"),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export { decrypt, encrypt };
