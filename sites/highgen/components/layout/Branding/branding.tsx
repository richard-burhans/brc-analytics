import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { type JSX } from "react";
import { Brands, FooterText } from "./branding.styles";

export const Branding = (): JSX.Element => {
  return (
    <Brands>
      <FooterText
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
      >
        A sister site of BRC Analytics and Genome Ark 2, built on
        <Link
          label=" galaxyproject/brc-analytics"
          url="https://github.com/galaxyproject/brc-analytics"
        />
      </FooterText>
    </Brands>
  );
};
