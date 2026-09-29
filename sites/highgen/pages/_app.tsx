import { setFeatureFlags } from "@databiosphere/findable-ui/lib/hooks/useFeatureFlag/common/utils";
import { config } from "@highgen/config/config";
import { HG_DEFAULT_DESCRIPTION } from "@highgen/meta/constants";
import { ensureEntitiesLoaded } from "@highgen/services/workflows/hooks/UseEntities/utils";
import "@highgen/styles/fonts/fonts.css";
import { createHgTheme } from "@highgen/theme/theme";
import {
  AppProviders,
  type AppPropsWithComponent,
} from "@repo/shared/components/layout/AppProviders/appProviders";
import { FEATURE_FLAGS } from "@repo/shared/config/featureFlags";
import { type JSX } from "react";

setFeatureFlags([FEATURE_FLAGS.DEMO]);

function MyApp(props: AppPropsWithComponent): JSX.Element {
  const appConfig = config();
  return (
    <AppProviders
      appConfig={appConfig}
      appProps={props}
      appTheme={createHgTheme(props.pageProps.themeOptions)}
      defaultDescription={HG_DEFAULT_DESCRIPTION}
      ensureEntitiesLoaded={ensureEntitiesLoaded}
    />
  );
}

export default MyApp;
