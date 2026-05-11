import { loadEnvConfig } from "@next/env";

export function loadAppEnv() {
  loadEnvConfig(process.cwd());
}
