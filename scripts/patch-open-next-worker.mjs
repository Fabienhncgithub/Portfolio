import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const handlerPath = path.join(
  process.cwd(),
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);
const workerPath = path.join(process.cwd(), ".open-next", "worker.js");

const marker = "/* OpenNext CommonJS bridge for managed Workers hosting. */";
const source = await readFile(handlerPath, "utf8");
const imports = `import * as __nodeAsyncHooks from "node:async_hooks";
import * as __nodeCrypto from "node:crypto";
import * as __nodeFs from "node:fs";
import * as __nodeHttp from "node:http";
import * as __nodeHttps from "node:https";
import * as __nodePath from "node:path";
import * as __nodeStream from "node:stream";
import * as __nodeStreamWeb from "node:stream/web";
import * as __nodeUrl from "node:url";
import * as __nodeUtil from "node:util";
import * as __nodeVm from "node:vm";
import * as __nodeZlib from "node:zlib";
import * as __nodeBuffer from "node:buffer";

const __nodeBuiltins = new Map([
  ["async_hooks", __nodeAsyncHooks],
  ["node:async_hooks", __nodeAsyncHooks],
  ["buffer", __nodeBuffer],
  ["node:buffer", __nodeBuffer],
  ["crypto", __nodeCrypto],
  ["node:crypto", __nodeCrypto],
  ["fs", __nodeFs],
  ["node:fs", __nodeFs],
  ["http", __nodeHttp],
  ["node:http", __nodeHttp],
  ["https", __nodeHttps],
  ["node:https", __nodeHttps],
  ["path", __nodePath],
  ["node:path", __nodePath],
  ["stream", __nodeStream],
  ["node:stream", __nodeStream],
  ["node:stream/web", __nodeStreamWeb],
  ["url", __nodeUrl],
  ["node:url", __nodeUrl],
  ["util", __nodeUtil],
  ["node:util", __nodeUtil],
  ["vm", __nodeVm],
  ["node:vm", __nodeVm],
  ["zlib", __nodeZlib],
  ["node:zlib", __nodeZlib],
]);
`;

if (!source.startsWith(marker)) {
  const bridge = `${marker}
${imports}
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

const workerSource = await readFile(workerPath, "utf8");

if (!workerSource.startsWith(marker)) {
  const workerBridge = `${marker}
${imports}
globalThis.require = (specifier) => {
  const module = __nodeBuiltins.get(specifier);

  if (!module) {
    throw new Error(\`Unsupported CommonJS module: \${specifier}\`);
  }

  return module;
};
`;

  await writeFile(workerPath, `${workerBridge}\n${workerSource}`);
}
