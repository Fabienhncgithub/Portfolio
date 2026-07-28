import {
  cleanBuildDirectories,
  runBuildCommand,
} from "./build-utils.mjs";

await cleanBuildDirectories(".next");
await runBuildCommand("next", ["build"]);
