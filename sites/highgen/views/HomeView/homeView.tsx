import { SectionAnalyticsAndData } from "@highgen/views/HomeView/components/SectionAnalyticsAndData/sectionAnalyticsAndData";
import { SectionHero } from "@highgen/views/HomeView/components/SectionHero/sectionHero";
import { SectionSubHero } from "@highgen/views/HomeView/components/SectionSubHero/sectionSubHero";
import { Fragment, type JSX } from "react";

export const HomeView = (): JSX.Element => {
  return (
    <Fragment>
      <SectionHero />
      <SectionSubHero />
      <SectionAnalyticsAndData />
    </Fragment>
  );
};
