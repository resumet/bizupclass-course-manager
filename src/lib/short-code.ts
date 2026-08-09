import { randomBytes } from "node:crypto";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const SHORT_CODE_LENGTH = 6;

export function generateShortCode() {
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  let code = "";
  for (let index = 0; index < SHORT_CODE_LENGTH; index += 1) {
    code += CHARACTERS[bytes[index] % CHARACTERS.length];
  }
  return code;
}
