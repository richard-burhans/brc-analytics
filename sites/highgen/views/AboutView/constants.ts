import { GalaxyIcon } from "@repo/shared/components/CustomIcon/components/GalaxyIcon/galaxyIcon";
import { RocketLaunchIcon } from "@repo/shared/components/CustomIcon/components/RocketLaunchIcon/rocketLaunchIcon";
import { type SectionContentCard } from "@repo/shared/views/docs/components/SectionContentCard/sectionContentCard";
import { type ComponentProps } from "react";

export const CARDS: ComponentProps<typeof SectionContentCard>[] = [
  {
    StartIcon: GalaxyIcon,
    href: "/about/partner-resources",
    secondaryText:
      "The partner projects behind HighGen: Galaxy, UCSC Genome Browser, and NCBI Datasets.",
    title: "Partner Resources",
  },
  {
    StartIcon: RocketLaunchIcon,
    href: "/about/roadmap",
    secondaryText:
      "Our current priorities, upcoming features, and longer-term direction for the platform.",
    title: "Roadmap",
  },
];
