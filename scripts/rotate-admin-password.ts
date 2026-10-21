/**
 * Rotate the existing admin password hash.
 *
 * Prompts in the terminal. Does not print the password or the hash.
 * Updates passwordHash on the one AdminUser that matches ADMIN_EMAIL
 * and increments sessionVersion so existing admin sessions stop working.
 * Does not create, delete, or change any other row.
 *
 * Run from the project root, in an interactive terminal:
 *   npm run db:rotate-admin-password
 */
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const MIN_LENGTH = 16;

function ask(label: string, hidden: boolean): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    if (hidden) {
      const muted = rl as readline.Interface & { _writeToOutput?: (s: string) => void };
      muted._writeToOutput = (text: string) => {
        if (text.startsWith(label) || text.includes("\n")) process.stdout.write(text);
      };
    }
    rl.question(label, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  if (!process.stdin.isTTY) {
    console.error("Run this in an interactive terminal. Nothing was changed.");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email) {
    console.error("ADMIN_EMAIL is not set. Nothing was changed.");
    process.exit(1);
  }

  let password = await ask("New admin password: ", true);
  let confirm = await ask("Repeat the new admin password: ", true);
  if (password.length < MIN_LENGTH || password !== confirm) {
    password = "";
    confirm = "";
    console.error("The passwords did not match, or the password is shorter than 16 characters. Nothing was changed.");
    process.exit(1);
  }
  confirm = "";

  const passwordHash = await bcrypt.hash(password, 12);
  password = "";

  const prisma = new PrismaClient();
  try {
    const matches = await prisma.adminUser.findMany({
      where: { email },
      select: { id: true },
    });
    if (matches.length !== 1 || !matches[0]) {
      console.error("The existing admin account was not found. Nothing was changed.");
      process.exit(1);
    }

    await prisma.adminUser.update({
      where: { id: matches[0].id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    console.log("Password hash updated. Existing admin sessions are no longer valid.");
  } catch {
    console.error("Database update failed. Nothing was printed from the database.");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
