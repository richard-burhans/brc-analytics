import { type AppSiteConfig } from "@repo/shared/config/types";
import { makeConfig } from "@site-config/highgen/local/config";

const BROWSER_URL = "https://highgen.dev.clevercanary.com";

const config: AppSiteConfig = makeConfig(BROWSER_URL);

export default config;
