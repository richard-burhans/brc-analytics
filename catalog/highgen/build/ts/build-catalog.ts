import type { WorkflowCategory } from "@repo/shared/apis/workflow";
import fsp from "fs/promises";
import {
  HGAssemblyEntity,
  HGMeasuredFields,
  ImageData,
} from "../../../../sites/highgen/apis/assembly";
import { HGOrganismEntity } from "../../../../sites/highgen/apis/organism";
import {
  getAssemblyId,
  getOrganismId,
} from "../../../../sites/highgen/apis/utils";
import {
  buildWorkflowAssemblyMappings,
  generateWorkflowMappingsQC,
} from "../../../build/ts/build-workflow-mappings";
import {
  defaultStringToNone,
  getMaxDefined,
  getPloidyForAssembly,
  getSourceOrganismsByTaxonomyId,
  getSpeciesStrainName,
  incrementValue,
  parseBoolean,
  parseList,
  parseNumber,
  parseNumberOrNull,
  parseStringOrNull,
  readValuesFile,
  readYamlFile,
  saveJson,
  verifyUniqueIds,
} from "../../../build/ts/utils";
import { SOURCE_GENOME_KEYS } from "./constants";
import { SourceExternalAssembly, SourceGenome } from "./entities";

const SOURCE_PATH_ORGANISMS = "catalog/highgen/source/organisms.yml";

const SOURCE_PATH_EXTERNAL_ASSEMBLIES =
  "catalog/highgen/source/external_assemblies.yml";

// Measured from each assembly's FASTA by measure_assemblies.py.
const SOURCE_PATH_MEASURED =
  "catalog/highgen/source/measured_assembly_stats.tsv";

const SOURCE_PATH_GENOMES =
  "catalog/highgen/build/intermediate/genomes-from-ncbi.tsv";

const MISSING_IMAGE_MARKER = "missing_image";

buildCatalog();

/**
 * Builds organism image data for a source row, or null when the row has no real
 * image (only the missing-image placeholder).
 * @param row - Source genome row.
 * @returns image data, or null when there is no real image.
 */
function buildOrganismImage(row: SourceGenome): ImageData | null {
  const url = resolveOrganismImageUrl(row.organismImageUrl);
  if (!url) return null;
  return {
    credit: row.organismImageCredit,
    license: row.organismImageLicense,
    sourceName: row.organismImageSourceName,
    sourceUrl: row.organismImageSourceUrl,
    url,
  };
}

/**
 * Converts a built organism-image path to its served URL, or null when it is
 * the missing-image placeholder — so the app can decide list-placeholder vs
 * detail-no-image rather than rendering the fallback everywhere.
 * @param path - Built image path (e.g. sites/highgen/public/organism_image/...).
 * @returns served URL (/organism_image/...), or null for a missing image.
 */
function resolveOrganismImageUrl(path: string): string | null {
  const basename = path.split("/").pop() ?? "";
  if (!path || basename.startsWith(MISSING_IMAGE_MARKER)) return null;
  return path.replace("sites/highgen/public/", "/");
}

/**
 * Returns the UCSC GenArk FASTA URL for an assembly, or null when GenArk does
 * not hold it under this accession. The workflow launch builds the same URL
 * from the accession, so an assembly without one cannot run FASTA workflows.
 * UCSC may list a GenBank row under its RefSeq twin; that twin's directory
 * does not serve the GenBank accession, so only an exact match counts.
 * @param accession - Assembly accession.
 * @param ucscBrowserUrl - UCSC browser URL from the GenArk assembly list.
 * @returns FASTA URL, or null.
 */
function getGenArkFastaUrl(
  accession: string,
  ucscBrowserUrl: string
): string | null {
  if (!ucscBrowserUrl.endsWith(`/${accession}`)) return null;
  const [prefix, digits] = accession.split("_");
  const dir = `${digits.slice(0, 3)}/${digits.slice(3, 6)}/${digits.slice(6, 9)}`;
  return `https://hgdownload.soe.ucsc.edu/hubs/${prefix}/${dir}/${accession}/${accession}.fa.gz`;
}

async function buildCatalog(): Promise<void> {
  const genomes = await buildAssemblies();
  const organisms = buildOrganisms(genomes);

  console.log("Assemblies:", genomes.length);
  await saveJson("catalog/highgen/output/assemblies.json", genomes);

  console.log("Organisms:", organisms.length);
  await saveJson("catalog/highgen/output/organisms.json", organisms);

  // Read workflows JSON at runtime to avoid E2BIG error
  // NOTE: This creates a build ordering dependency - BRC catalog must be built
  // before HighGen catalog since HighGen reads catalog/output/workflows.json (a BRC artifact).
  // Do not rearrange build steps without ensuring workflows.json exists first.
  const workflowCategoriesJson = await fsp.readFile(
    "catalog/output/workflows.json",
    "utf8"
  );
  const workflowCategories: WorkflowCategory[] = JSON.parse(
    workflowCategoriesJson
  );

  // Compute and save workflow-assembly mappings (using shared utility)
  const mappings = buildWorkflowAssemblyMappings(workflowCategories, genomes);
  console.log("Workflow-Assembly Mappings:", mappings.length);
  await saveJson(
    "catalog/highgen/output/workflow-assembly-mappings.json",
    mappings
  );

  // Generate workflow mappings QC report (pass "HighGen" as site name)
  const qcReport = generateWorkflowMappingsQC(
    mappings,
    workflowCategories,
    "HighGen",
    genomes
  );
  await fsp.writeFile(
    "catalog/highgen/output/qc-report.workflow-mappings.md",
    qcReport
  );

  console.log("Done");
}

// Cannabis chromosomes in cs10 run from 61.6 to 105 Mb, so an N50 of 50 Mb
// means at least half the assembly is in near-chromosome-length pieces.
const CHROMOSOME_SCALE_N50 = 50_000_000;
const MEGABASE_SCALE_N50 = 1_000_000;

/**
 * Classifies an assembly's contiguity from its scaffold N50, for comparison
 * with the level its submitter declared. Salk N50s are BUSCO's whole-megabase
 * figures, far from either threshold.
 * @param n50 - Scaffold N50 in bp, or null when none was recorded.
 * @returns measured level label.
 */
function getMeasuredLevel(n50: number | null): string {
  if (n50 === null) return "Not measured";
  if (n50 >= CHROMOSOME_SCALE_N50) return "Chromosome-scale";
  if (n50 >= MEGABASE_SCALE_N50) return "Megabase-scale";
  return "Kilobase-scale";
}

type ReportedAssembly = Omit<HGAssemblyEntity, keyof HGMeasuredFields>;

interface Measured {
  contigN50: number;
  gcPercent: number | null;
  length: number;
  scaffoldL50: number;
  scaffoldN50: number;
  sequences: number;
  top10Frac: number;
}

/**
 * Reads the per-assembly measurements, keyed by catalog accession.
 * @returns measurements by accession.
 */
async function readMeasured(): Promise<Map<string, Measured>> {
  const rows = await readValuesFile<Record<string, string>>(
    SOURCE_PATH_MEASURED,
    "\t",
    ["accession", "sequences", "total_bp", "scaffold_n50", "gc_percent"]
  );
  return new Map(
    rows.map((row) => [
      row.accession,
      {
        contigN50: parseNumber(row.contig_n50),
        gcPercent: parseNumberOrNull(row.gc_percent),
        length: parseNumber(row.total_bp),
        scaffoldL50: parseNumber(row.scaffold_l50),
        scaffoldN50: parseNumber(row.scaffold_n50),
        sequences: parseNumber(row.sequences),
        top10Frac: parseNumber(row.top10_frac),
      },
    ])
  );
}

// NCBI rounds GC% to the nearest 0.5, so a true value is within 0.25 of it.
const GC_TOLERANCE = 0.26;

const formatCount = (value: number): string => value.toLocaleString("en-US");

/**
 * Describes how a measured N50 differs from a reported one: as a ratio when
 * they are far apart, otherwise as a difference in bp.
 * @param measured - Measured N50.
 * @param reported - Reported N50.
 * @returns description.
 */
function describeN50(measured: number, reported: number): string {
  const ratio = measured / reported;
  if (ratio >= 1.5) return `N50 ${ratio.toFixed(0)}x higher than reported`;
  if (ratio <= 1 / 1.5)
    return `N50 ${(1 / ratio).toFixed(0)}x lower than reported`;
  const diff = measured - reported;
  return `N50 ${diff > 0 ? "+" : ""}${formatCount(diff)} bp`;
}

/**
 * Compares reported values with measured ones. An N50 the source truncated to
 * whole megabases (Salk's BUSCO figures) agrees when the measured N50 is in
 * [reported, reported + 1 Mb); GC agrees within NCBI's rounding; every other
 * value must match exactly. Fields with no reported value are not compared.
 * @param reported - Assembly with its reported values.
 * @param measured - Values measured from its FASTA.
 * @param n50Truncated - Whether the reported N50 is truncated to whole Mb.
 * @returns status, a description of the differences, and the differing fields.
 */
function compareReported(
  reported: ReportedAssembly,
  measured: Measured,
  n50Truncated: boolean
): { detail: string; fields: string[]; status: string } {
  const parts: string[] = [];
  const fields: string[] = [];
  const differ = (field: string, text: string): void => {
    fields.push(field);
    parts.push(text);
  };
  const rep = reported.scaffoldN50;
  if (rep !== null) {
    const agrees = n50Truncated
      ? measured.scaffoldN50 >= rep && measured.scaffoldN50 < rep + 1_000_000
      : measured.scaffoldN50 === rep;
    if (!agrees) differ("scaffoldN50", describeN50(measured.scaffoldN50, rep));
  }
  if (
    reported.scaffoldL50 !== null &&
    reported.scaffoldL50 !== measured.scaffoldL50
  )
    differ(
      "scaffoldL50",
      `L50 ${formatCount(measured.scaffoldL50)}, reported ${formatCount(reported.scaffoldL50)}`
    );
  if (
    reported.scaffoldCount !== null &&
    reported.scaffoldCount !== measured.sequences
  )
    differ(
      "scaffoldCount",
      `${formatCount(measured.sequences)} sequences, reported ${formatCount(reported.scaffoldCount)}`
    );
  if (reported.length !== measured.length)
    differ(
      "length",
      `length ${formatCount(measured.length - reported.length)} bp`
    );
  if (
    reported.gcPercent !== null &&
    measured.gcPercent !== null &&
    Math.abs(reported.gcPercent - measured.gcPercent) > GC_TOLERANCE
  )
    differ(
      "gcPercent",
      `GC ${measured.gcPercent}%, reported ${reported.gcPercent}%`
    );
  if (parts.length)
    return { detail: parts.join("; "), fields, status: "Differs" };
  if (rep === null)
    return { detail: "no N50 reported", fields, status: "Not reported" };
  return { detail: "", fields, status: "Agrees" };
}

/**
 * Adds measured values and the reported-vs-measured comparison to each row.
 * @param rows - Assemblies with their reported values.
 * @param n50TruncatedIds - Accessions whose reported N50 is truncated to whole Mb.
 * @returns complete assembly entities.
 */
async function attachMeasurements(
  rows: ReportedAssembly[],
  n50TruncatedIds: Set<string>
): Promise<HGAssemblyEntity[]> {
  const measuredByAccession = await readMeasured();
  return rows.map((row) => {
    const measured = measuredByAccession.get(row.accession);
    if (!measured)
      throw new Error(
        `No measurement for ${row.accession} in ${SOURCE_PATH_MEASURED}`
      );
    const { detail, fields, status } = compareReported(
      row,
      measured,
      n50TruncatedIds.has(row.accession)
    );
    return {
      ...row,
      calcContigN50: measured.contigN50,
      calcGcPercent: measured.gcPercent,
      calcLength: measured.length,
      calcScaffoldL50: measured.scaffoldL50,
      calcScaffoldN50: measured.scaffoldN50,
      calcSequences: measured.sequences,
      calcTop10Frac: measured.top10Frac,
      measuredLevel: getMeasuredLevel(measured.scaffoldN50),
      reportedDiffers: fields,
      reportedVsCalculated: status,
      reportedVsCalculatedDetail: detail,
    };
  });
}

async function buildAssemblies(): Promise<HGAssemblyEntity[]> {
  const sourceRows = await readValuesFile<SourceGenome>(
    SOURCE_PATH_GENOMES,
    undefined,
    SOURCE_GENOME_KEYS
  );
  const sourceOrganismsByTaxonomyId = await getSourceOrganismsByTaxonomyId(
    SOURCE_PATH_ORGANISMS
  );

  const mappedRows: ReportedAssembly[] = [];
  for (const row of sourceRows) {
    const ploidy = getPloidyForAssembly(
      sourceOrganismsByTaxonomyId,
      row.speciesTaxonomyId,
      true,
      row.accession
    );
    if (ploidy === null) continue;
    const tolIds = parseList(row.tolId);
    if (tolIds.length > 1)
      console.log(
        `Warning: Multiple ToLIDs found for ${row.accession} (${tolIds.join(", ")})`
      );
    mappedRows.push({
      accession: row.accession,
      annotationStatus: parseStringOrNull(row.annotationStatus),
      chromosomes: parseNumberOrNull(row.chromosomeCount),
      citation: null,
      coverage: parseStringOrNull(row.coverage),
      doi: null,
      fastaUrl: getGenArkFastaUrl(row.accession, row.ucscBrowser),
      galaxyDatacacheUrl: parseStringOrNull(row.galaxyDatacacheUrl),
      gcPercent: parseNumberOrNull(row.gcPercent),
      geneModelUrl: parseStringOrNull(row.geneModelUrl),
      image: buildOrganismImage(row),
      isRef: parseBoolean(row.isRef),
      length: parseNumber(row.length),
      level: row.level,
      license: null,
      licenseUrl: null,
      lineageTaxonomyIds: parseList(row.lineageTaxonomyIds),
      ncbiTaxonomyId: row.taxonomyId,
      ploidy,
      releaseDate: row.releaseDate,
      scaffoldCount: parseNumberOrNull(row.scaffoldCount),
      scaffoldL50: parseNumberOrNull(row.scaffoldL50),
      scaffoldN50: parseNumberOrNull(row.scaffoldN50),
      source: "NCBI",
      sourceUrl: `https://www.ncbi.nlm.nih.gov/datasets/genome/${row.accession}/`,
      speciesTaxonomyId: row.speciesTaxonomyId,
      strainName: parseStringOrNull(row.strain),
      taxonomicGroup: parseList(row.taxonomicGroup),
      taxonomicLevelClass: defaultStringToNone(row.taxonomicLevelClass),
      taxonomicLevelDomain: defaultStringToNone(row.taxonomicLevelDomain),
      taxonomicLevelFamily: defaultStringToNone(row.taxonomicLevelFamily),
      taxonomicLevelGenus: defaultStringToNone(row.taxonomicLevelGenus),
      taxonomicLevelKingdom: defaultStringToNone(row.taxonomicLevelKingdom),
      taxonomicLevelOrder: defaultStringToNone(row.taxonomicLevelOrder),
      taxonomicLevelPhylum: defaultStringToNone(row.taxonomicLevelPhylum),
      taxonomicLevelSpecies: defaultStringToNone(row.taxonomicLevelSpecies),
      taxonomicLevelStrain: getSpeciesStrainName(
        row.taxonomicLevelSpecies,
        row.taxonomicLevelStrain,
        row.strain
      ),
      thumbnailUrl: resolveOrganismImageUrl(row.organismThumbnailUrl),
      tolId: tolIds[0] ?? null,
      ucscBrowserUrl: parseStringOrNull(row.ucscBrowser),
    });
  }

  const n50TruncatedIds = new Set<string>();
  mappedRows.push(
    ...(await buildExternalAssemblies(mappedRows, n50TruncatedIds))
  );

  const measuredRows = await attachMeasurements(mappedRows, n50TruncatedIds);
  const sortedRows = measuredRows.sort((a, b) =>
    a.accession.localeCompare(b.accession)
  );
  verifyUniqueIds("assembly", sortedRows, getAssemblyId);
  return sortedRows;
}

/**
 * Builds entities for assemblies with no NCBI record. They take their
 * taxonomy from a Cannabis sativa NCBI assembly, have no FASTA the workflow
 * launch can reach (fastaUrl null, so FASTA workflows are not offered), and
 * link to the repository that publishes them.
 * @param ncbiRows - Entities built from NCBI records.
 * @param n50TruncatedIds - Filled with ids whose reported N50 is truncated to whole Mb.
 * @returns external assembly entities.
 */
async function buildExternalAssemblies(
  ncbiRows: ReportedAssembly[],
  n50TruncatedIds: Set<string>
): Promise<ReportedAssembly[]> {
  const { assemblies } = await readYamlFile<{
    assemblies: SourceExternalAssembly[];
  }>(SOURCE_PATH_EXTERNAL_ASSEMBLIES);
  for (const row of assemblies)
    if (row.n50_rounded_to_mb) n50TruncatedIds.add(row.id);
  const species = ncbiRows.find(
    (row) => row.ncbiTaxonomyId === row.speciesTaxonomyId
  );
  if (!species) throw new Error("No species-level NCBI assembly to copy");
  return assemblies.map((row) => ({
    ...species,
    accession: row.id,
    annotationStatus: null,
    chromosomes: null,
    citation: row.citation,
    coverage: null,
    doi: row.doi,
    fastaUrl: null,
    galaxyDatacacheUrl: null,
    gcPercent: null,
    geneModelUrl: null,
    isRef: "No",
    length: row.length,
    level: row.level,
    license: row.license,
    licenseUrl: row.license_url,
    releaseDate: "",
    scaffoldCount: row.sequence_count,
    scaffoldL50: null,
    scaffoldN50: row.scaffold_n50,
    source: row.source,
    sourceUrl: row.landing_url,
    strainName: row.name,
    taxonomicLevelStrain: `${species.taxonomicLevelSpecies} ${row.name}`,
    ucscBrowserUrl: null,
  }));
}

function buildOrganisms(genomes: HGAssemblyEntity[]): HGOrganismEntity[] {
  const organismsByTaxonomyId = new Map<string, HGOrganismEntity>();
  for (const genome of genomes) {
    organismsByTaxonomyId.set(
      genome.speciesTaxonomyId,
      buildOrganism(organismsByTaxonomyId.get(genome.speciesTaxonomyId), genome)
    );
  }
  const sortedRows = Array.from(organismsByTaxonomyId.values()).sort((a, b) =>
    a.ncbiTaxonomyId.localeCompare(b.ncbiTaxonomyId)
  );
  verifyUniqueIds("organism", sortedRows, getOrganismId);
  return sortedRows;
}

function buildOrganism(
  organism: HGOrganismEntity | undefined,
  genome: HGAssemblyEntity
): HGOrganismEntity {
  return {
    assemblyCount: incrementValue(organism?.assemblyCount),
    assemblyTaxonomyIds: Array.from(
      new Set([...(organism?.assemblyTaxonomyIds ?? []), genome.ncbiTaxonomyId])
    ),
    genomes: [...(organism?.genomes ?? []), genome],
    image: organism?.image ?? genome.image,
    maxScaffoldN50: getMaxDefined(
      organism?.maxScaffoldN50,
      genome.calcScaffoldN50
    ),
    ncbiTaxonomyId: genome.speciesTaxonomyId,
    taxonomicGroup: genome.taxonomicGroup,
    taxonomicLevelClass: defaultStringToNone(genome.taxonomicLevelClass),
    taxonomicLevelDomain: defaultStringToNone(genome.taxonomicLevelDomain),
    taxonomicLevelFamily: defaultStringToNone(genome.taxonomicLevelFamily),
    taxonomicLevelGenus: defaultStringToNone(genome.taxonomicLevelGenus),
    taxonomicLevelKingdom: defaultStringToNone(genome.taxonomicLevelKingdom),
    taxonomicLevelOrder: defaultStringToNone(genome.taxonomicLevelOrder),
    taxonomicLevelPhylum: defaultStringToNone(genome.taxonomicLevelPhylum),
    taxonomicLevelSpecies: genome.taxonomicLevelSpecies,
    thumbnailUrl: organism?.thumbnailUrl ?? genome.thumbnailUrl,
    tolId: genome.tolId,
  };
}
