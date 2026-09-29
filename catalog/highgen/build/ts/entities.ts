import { SOURCE_GENOME_KEYS } from "./constants";

export type SourceGenome = Record<(typeof SOURCE_GENOME_KEYS)[number], string>;

/**
 * An assembly with no NCBI record, as written to external_assemblies.yml by
 * build_external_assemblies.py.
 */
export interface SourceExternalAssembly {
  citation: string | null;
  doi: string | null;
  has_gff3: boolean;
  id: string;
  inventory_id: string;
  landing_url: string;
  length: number;
  level: string;
  license: string;
  license_url: string | null;
  n50_rounded_to_mb: boolean;
  name: string;
  scaffold_n50: number | null;
  sequence_count: number | null;
  source: string;
  source_set: string;
}
