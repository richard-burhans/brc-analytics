import { type HGAssemblyEntity, type ImageData } from "./assembly";

export interface HGOrganismEntity {
  assemblyCount: number;
  assemblyTaxonomyIds: string[];
  genomes: HGAssemblyEntity[];
  image: ImageData | null;
  maxScaffoldN50: number | null;
  ncbiTaxonomyId: string;
  taxonomicGroup: string[];
  taxonomicLevelClass: string;
  taxonomicLevelDomain: string;
  taxonomicLevelFamily: string;
  taxonomicLevelGenus: string;
  taxonomicLevelKingdom: string;
  taxonomicLevelOrder: string;
  taxonomicLevelPhylum: string;
  taxonomicLevelSpecies: string;
  thumbnailUrl: string | null;
  tolId: string;
}
