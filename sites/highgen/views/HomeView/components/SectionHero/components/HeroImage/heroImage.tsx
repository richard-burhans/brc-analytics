import Image from "next/image";
import { type JSX } from "react";
import { IMAGE_PROPS } from "./constants";
import { StyledContainer } from "./heroImage.styles";

export const HeroImage = (): JSX.Element => {
  return (
    <StyledContainer disableGutters>
      <Image
        {...IMAGE_PROPS}
        alt="Cannabis sativa, Köhler's Medizinal-Pflanzen (1887)"
      />
    </StyledContainer>
  );
};
