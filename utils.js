import promptly from "promptly"

export async function readInput(txt) {
  return await promptly.prompt(`[?] ${txt}`);
}
export async function readPassword(txt) {
  return await promptly.password(`[?] ${txt}`);
}

export function sanitizeName(n) {
  return n.replace(/ /gm, "_").replace(/"/gm, '\"').replace(/'/gm, "_").replace(/,/gm, "_").replace(/:/gm, "_");
}

export function printInfo(text) {
  console.log(`[-] ${text}`)
}

export function printError(text) {
  console.log(`[x] ${text}`)
}

export function printQuestion(text) {
  console.log(`[?] ${text}`)
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export function getDirname() { return __dirname }
