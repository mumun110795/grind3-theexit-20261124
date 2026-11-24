import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The whole entry: one sendable line, formal on the surface.
const RESIGNATION_LINE =
  "I hereby resign, effective immediately, to spend more time with my family — whom I finally met during the fire drill and quite like.";

const GATE_MIN = 1;
const GATE_MAX = 140;

function checkLine(text: string): void {
  const length = [...text].length;
  if (length < GATE_MIN || length > GATE_MAX) {
    throw new Error(
      `Resignation line is ${length} characters; the gate allows ${GATE_MIN}-${GATE_MAX}.`,
    );
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Resignation line must stay on a single line.");
  }
  if (text.trim().length === 0) {
    throw new Error("Resignation line must not be blank.");
  }
}

function resolveOutputDir(): string {
  const fromEnv = process.env.OUTPUT_DIR;
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv : "/output";
}

function main(): void {
  checkLine(RESIGNATION_LINE);

  const outDir = resolveOutputDir();
  // The output dir may be a mounted volume, so create it if needed and
  // only ever write into it — never remove the directory itself.
  mkdirSync(outDir, { recursive: true });

  const target = join(outDir, "entry.txt");
  writeFileSync(target, RESIGNATION_LINE, { encoding: "utf8" });

  // Read the file back and verify it matches the intended entry exactly:
  // a short or altered write would otherwise ship silently.
  const written = readFileSync(target, { encoding: "utf8" });
  if (written !== RESIGNATION_LINE) {
    throw new Error(
      `Written entry does not match the intended resignation line: got ${[...written].length} characters, expected ${[...RESIGNATION_LINE].length}.`,
    );
  }

  console.log(`Wrote ${[...RESIGNATION_LINE].length} characters to ${target}`);
}

main();
