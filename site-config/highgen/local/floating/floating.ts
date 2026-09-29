import {
  type ComponentConfig,
  type FloatingConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { StyledViewSupport } from "@highgen/components/layout/ViewSupport/viewSupport.styles";
import { SUPPORT_URL } from "@site-config/highgen/local/constants";

export const floating: FloatingConfig = {
  components: [
    {
      component: StyledViewSupport,
      props: {
        url: SUPPORT_URL,
      },
    } as ComponentConfig<typeof StyledViewSupport>,
  ],
};
