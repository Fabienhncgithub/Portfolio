import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";

export const projectRoot = process.cwd();

export function createBuildEnvironment() {
  const environment = { ...process.env };

  if (process.env.BUILD_WITH_STRAPI !== "true") {
    environment.STRAPI_URL = "";
    environment.STRAPI_API_TOKEN = "";
    environment.STRAPI_WEBHOOK_SECRET = "";
    environment.CMS_REQUIRED = "false";
  }

  return environment;
}

export async function cleanBuildDirectories(...directories) {
  await Promise.all(directories.map((directory) => (
    rm(path.join(projectRoot, directory), { force: true, recursive: true })
  )));
}

export function runBuildCommand(command, args, environment = createBuildEnvironment()) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: environment,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(
        signal
          ? `${command} stopped with signal ${signal}`
          : `${command} exited with code ${code ?? "unknown"}`,
      ));
    });
  });
}
