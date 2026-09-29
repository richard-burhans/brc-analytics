import { SectionHero } from "@repo/shared/components/layout/SectionHero/sectionHero";
import { Fragment, type JSX } from "react";
import { BREADCRUMBS } from "./constants";
import SectionRoadmap from "./content/sectionRoadmap.mdx";

export const RoadmapView = (): JSX.Element => {
  return (
    <Fragment>
      <SectionHero
        breadcrumbs={BREADCRUMBS}
        head="Roadmap"
        subHead={
          <>
            HighGen lets you combine the public Cannabis sativa genome
            assemblies with your own data using the Galaxy Platform. We aim to
            make it simple to analyze those assemblies, compare them across
            cultivars, and feed results back to the community.
          </>
        }
      />
      <SectionRoadmap />
    </Fragment>
  );
};
