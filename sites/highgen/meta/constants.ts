/**
 * Page metadata for HighGen — titles and descriptions used in OG/Twitter meta tags.
 */

export const HG_DEFAULT_DESCRIPTION =
  "HighGen: explore and analyze public Cannabis sativa genome assemblies using Galaxy workflows.";

export const HG_PAGE_META = {
  ABOUT: {
    pageDescription:
      "Learn about the HighGen platform for cannabis genome analysis.",
    pageTitle: "About",
  },
  ANALYZE_WORKFLOWS: {
    pageDescription:
      "Select and configure workflows for genome analysis on HighGen.",
    pageTitle: "Analyze",
  },
  ASSEMBLIES: {
    pageDescription:
      "Browse genome assemblies available for analysis on HighGen.",
    pageTitle: "Assemblies",
  },
  ASSEMBLY_DETAIL: {
    pageDescription:
      "Select and configure workflows for genome analysis on HighGen.",
    pageTitle: "Analyze",
  },
  CUSTOM_WORKFLOW: {
    pageDescription:
      "Configure a custom workflow for genome analysis on HighGen.",
    pageTitle: "Custom Workflow",
  },
  HOME: {
    pageDescription: HG_DEFAULT_DESCRIPTION,
    pageTitle: "HighGen",
  },
  ORGANISMS: {
    pageDescription: "Browse organisms with genome assemblies on HighGen.",
    pageTitle: "Organisms",
  },
  ORGANISM_DETAIL: {
    pageDescription:
      "View organism details and available genome assemblies on HighGen.",
    pageTitle: "Organism",
  },
  PARTNER_RESOURCES: {
    pageDescription:
      "Learn about the partner projects behind HighGen: Galaxy, UCSC Genome Browser, and NCBI.",
    pageTitle: "Partner Resources",
  },
  ROADMAP: {
    pageDescription: "View the development roadmap for HighGen.",
    pageTitle: "Roadmap",
  },
  WORKFLOW: {
    pageDescription: "View workflow details on HighGen.",
    pageTitle: "Workflow",
  },
  WORKFLOWS: {
    pageDescription:
      "Explore Galaxy workflows available for genomic analysis on HighGen.",
    pageTitle: "Workflows",
  },
} as const;
