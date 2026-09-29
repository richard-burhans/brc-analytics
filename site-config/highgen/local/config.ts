import { Logo } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { type EntityConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { type HGAssemblyEntity } from "@highgen/apis/assembly";
import { type HGOrganismEntity } from "@highgen/apis/organism";
import { Branding } from "@highgen/components/layout/Branding/branding";
import { ROUTES as SITE_ROUTES } from "@highgen/routes/constants";
import { type AppSiteConfig } from "@repo/shared/config/types";
import { ROUTES } from "@repo/shared/routes/constants";
import { type WorkflowEntity } from "@repo/shared/views/WorkflowsView/types";
import { SUPPORT_URL } from "./constants";
import { floating } from "./floating/floating";
import { genomeEntityConfig } from "./index/genome/genomeEntityConfig";
import { organismEntityConfig } from "./index/organism/organismEntityConfig";
import { workflowEntityConfig } from "./index/workflow/workflowEntityConfig";
import { socialMedia } from "./socialMedia";

const LOCALHOST = "http://localhost:3000";
const APP_TITLE = "HighGen";
const BROWSER_URL = LOCALHOST;
const GIT_HUB_REPO_URL = "https://github.com/richard-burhans/brc-analytics";

/**
 * Make site config object.
 * @param browserUrl - Browser URL.
 * @param gitHubUrl - GitHub URL.
 * @remarks
 * The `genomeEntityConfig` is typecast to `EntityConfig<HGAssemblyEntity>`
 * because the `SiteConfig` interface from the `@databiosphere/findable-ui` package expects
 * an array of entities typed as `EntityConfig`, but we have modified the EntityConfig
 * locally with a custom `AppEntityConfig` entity. To avoid rewriting
 * the associated functions and providers across the codebase due to this modification,
 * we perform a type cast here. This allows us to retain compatibility with the existing
 * `SiteConfig` structure while accommodating the modified entity configuration.
 *
 * @returns site config.
 */
export function makeConfig(
  browserUrl: string,
  gitHubUrl = GIT_HUB_REPO_URL
): AppSiteConfig {
  return {
    appTitle: APP_TITLE,
    browserURL: browserUrl,
    dataSource: {
      url: "",
    },
    entities: [
      organismEntityConfig as EntityConfig<HGOrganismEntity>,
      genomeEntityConfig as EntityConfig<HGAssemblyEntity>,
      workflowEntityConfig as EntityConfig<WorkflowEntity>,
    ],
    gitHubUrl,
    layout: {
      floating,
      footer: {
        Branding: Branding(),
        navLinks: [
          {
            label: "BRC Analytics",
            target: ANCHOR_TARGET.BLANK,
            url: "https://brc-analytics.org/",
          },
          {
            label: "Genome Ark 2",
            target: ANCHOR_TARGET.BLANK,
            url: "https://genomeark2.org/",
          },
        ],
        socials: socialMedia.socials,
        versionInfo: true,
      },
      header: {
        logo: Logo({
          alt: APP_TITLE,
          height: 28,
          link: "/",
          src: "/logo/highgen.svg",
        }),
        navigation: [
          undefined,
          [
            { label: "About", url: SITE_ROUTES.ABOUT },
            { label: "Organisms", url: ROUTES.ORGANISMS },
            { label: "Assemblies", url: ROUTES.GENOMES },
            { label: "Workflows", url: ROUTES.WORKFLOWS },
          ],
          undefined,
        ],
      },
    },
    // HighGen has no account UI wired up; state that explicitly rather than
    // leaving the key absent, which reads as an oversight rather than a
    // decision.
    loginEnabled: false,
    maxReadRunsForBrowseAll: 80000,
    redirectRootToPath: "/",
    supportUrl: SUPPORT_URL,
  };
}

const config: AppSiteConfig = makeConfig(BROWSER_URL);

export default config;
