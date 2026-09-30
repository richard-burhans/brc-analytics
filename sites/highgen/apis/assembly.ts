import type { ORGANISM_PLOIDY } from "@repo/shared/apis/schema-types";

export interface HGAssemblyEntity {
  accession: string;
  annotationStatus: string | null;
  chromosomes: number | null;
  citation: string | null;
  coverage: string | null;
  doi: string | null;
  fastaUrl: string | null;
  galaxyDatacacheUrl: string | null;
  gcPercent: number | null;
  geneModelUrl: string | null;
  image: ImageData | null;
  isRef: "No" | "Yes";
  length: number;
  level: string;
  license: string | null;
  licenseUrl: string | null;
  lineageTaxonomyIds: string[];
  // Contiguity class from scaffold N50 (see getMeasuredLevel in build-catalog.ts).
  measuredLevel: string;
  ncbiTaxonomyId: string;
  ploidy: ORGANISM_PLOIDY[];
  releaseDate: string;
  scaffoldCount: number | null;
  scaffoldL50: number | null;
  scaffoldN50: number | null;
  // Where the assembly is published: "NCBI" or an external repository.
  source: string;
  sourceUrl: string | null;
  speciesTaxonomyId: string;
  strainName: string | null;
  taxonomicGroup: string[];
  taxonomicLevelClass: string;
  taxonomicLevelDomain: string;
  taxonomicLevelFamily: string;
  taxonomicLevelGenus: string;
  taxonomicLevelKingdom: string;
  taxonomicLevelOrder: string;
  taxonomicLevelPhylum: string;
  taxonomicLevelSpecies: string;
  taxonomicLevelStrain: string;
  thumbnailUrl: string | null;
  tolId: string;
  ucscBrowserUrl: string | null;
}

export interface ImageData {
  credit: string | null;
  license: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  url: string;
}
