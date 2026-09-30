import type { ORGANISM_PLOIDY } from "@repo/shared/apis/schema-types";

/**
 * Values measured from each assembly's FASTA (measure_assemblies.py), and how
 * they compare with the reported ones.
 */
export interface HGMeasuredFields {
  calcContigN50: number;
  calcGcPercent: number | null;
  calcLength: number;
  calcScaffoldL50: number;
  calcScaffoldN50: number;
  calcSequences: number;
  calcTop10Frac: number;
  // Contiguity class from the calculated scaffold N50.
  measuredLevel: string;
  // Reported fields whose calculated value differs (e.g. "scaffoldN50").
  reportedDiffers: string[];
  // "Agrees", "Differs" or "Not reported".
  reportedVsCalculated: string;
  reportedVsCalculatedDetail: string;
}

export interface HGAssemblyEntity extends HGMeasuredFields {
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
