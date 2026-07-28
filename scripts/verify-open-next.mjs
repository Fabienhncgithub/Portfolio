import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const outputRoot = path.join(projectRoot, ".open-next");
const requiredFiles = [
  path.join(outputRoot, "worker.js"),
  path.join(outputRoot, "server-functions", "default", "handler.mjs"),
];

await Promise.all(requiredFiles.map((file) => access(file)));

const handler = await readFile(requiredFiles[1], "utf8");
if (!handler.startsWith("/* OpenNext CommonJS bridge for managed Workers hosting. */")) {
  throw new Error("The managed Worker compatibility bridge is missing.");
}
const worker = await readFile(requiredFiles[0], "utf8");
if (!worker.startsWith("/* OpenNext CommonJS bridge for managed Workers hosting. */")) {
  throw new Error("The managed Worker entry compatibility bridge is missing.");
}

const textExtensions = new Set([".html", ".js", ".json", ".mjs", ".rsc", ".txt", ".xml"]);
const localMediaPattern =
  /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\/uploads\//i;
const entries = await readdir(outputRoot, { recursive: true, withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile() || !textExtensions.has(path.extname(entry.name))) continue;

  const file = path.join(entry.parentPath || entry.path, entry.name);
  const content = await readFile(file, "utf8");

  if (localMediaPattern.test(content)) {
    throw new Error(`Local Strapi media leaked into the hosting bundle: ${file}`);
  }
}

console.log("OpenNext hosting bundle verified.");
