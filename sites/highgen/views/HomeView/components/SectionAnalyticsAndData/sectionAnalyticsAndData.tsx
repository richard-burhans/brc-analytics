import { AnalyticsTools } from "@repo/shared/views/HomeView/components/Section/components/SectionAnalytics/components/AnalyticsTools/analyticsTools";
import {
  SectionSubtitle,
  SectionTitle,
} from "@repo/shared/views/HomeView/components/Section/section.styles";
import { type JSX } from "react";
import { ANALYTICS_TOOLS } from "./constants";
import {
  Headline,
  Section,
  SectionLayout,
} from "./sectionAnalyticsAndData.styles";

export const SectionAnalyticsAndData = (): JSX.Element => {
  return (
    <Section>
      <SectionLayout>
        <Headline>
          <SectionTitle>What is HighGen?</SectionTitle>
          <SectionSubtitle>
            HighGen brings together the public Cannabis sativa genome assemblies
            from NCBI Datasets and the UCSC Genome Browser, and launches
            analyses on them in the Galaxy platform at usegalaxy.org.
          </SectionSubtitle>
        </Headline>
        <AnalyticsTools cards={ANALYTICS_TOOLS} />
      </SectionLayout>
    </Section>
  );
};
