import {
  cleanBuildDirectories,
  runBuildCommand,
} from "./build-utils.mjs";

await cleanBuildDirectories(".next", ".open-next");
await runBuildCommand("opennextjs-cloudflare", ["build"]);
await runBuildCommand(process.execPath, ["scripts/patch-open-next-worker.mjs"]);
await runBuildCommand(process.execPath, ["scripts/verify-open-next.mjs"]);
