import { createConfig } from "@repo/shared/config/createConfig";
import { ENVIRONMENT } from "@repo/shared/config/environment";
import highgenDev from "@site-config/highgen/dev/config";
import highgenLocal from "@site-config/highgen/local/config";
import highgenProd from "@site-config/highgen/prod/config";

/**
 * Resolves the site config for the active environment.
 * @returns app site config.
 */
export const config = createConfig({
  [ENVIRONMENT.DEV]: highgenDev,
  [ENVIRONMENT.LOCAL]: highgenLocal,
  [ENVIRONMENT.PROD]: highgenProd,
});
