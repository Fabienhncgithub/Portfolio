import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const handlerPath = path.join(
  process.cwd(),
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);

const marker = "/* OpenNext CommonJS bridge for managed Workers hosting. */";
const source = await readFile(handlerPath, "utf8");

if (!source.startsWith(marker)) {
  const bridge = `${marker}
import * as __nodeAsyncHooks from "node:async_hooks";
import * as __nodeCrypto from "node:crypto";
import * as __nodePath from "node:path";
import * as __nodeStream from "node:stream";
import * as __nodeStreamWeb from "node:stream/web";
import * as __nodeZlib from "node:zlib";

const __nodeBuiltins = new Map([
  ["node:async_hooks", __nodeAsyncHooks],
  ["node:crypto", __nodeCrypto],
  ["node:path", __nodePath],
  ["node:stream", __nodeStream],
  ["node:stream/web", __nodeStreamWeb],
  ["node:zlib", __nodeZlib],
]);

const require = (specifier) => {
  const module = __nodeBuiltins.get(specifier);

  if (!module) {
    throw new Error(\`Unsupported CommonJS module: \${specifier}\`);
  }

  return module;
};
`;

  await writeFile(handlerPath, `${bridge}\n${source}`);
}
