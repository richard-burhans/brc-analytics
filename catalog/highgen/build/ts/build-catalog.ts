import type { WorkflowCategory } from "@repo/shared/apis/workflow";
import fsp from "fs/promises";
import {
  HGAssemblyEntity,
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

// Contiguity derived from NCBI's per-sequence reports (primary assembly only),
// copied from the cannabis-genome survey's data/processed/ncbi_contiguity.csv.
// NCBI's own scaffold fields are wrong for some cannabis records.
const SOURCE_PATH_NCBI_CONTIGUITY =
  "catalog/highgen/source/ncbi_contiguity.csv";

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

/**
 * Reads contiguity derived from NCBI's full per-sequence reports, keyed by
 * accession. These replace NCBI's assembly-level scaffold fields, which for
 * Purple Kush and Finola carry contig values (N50 455x and 208x too small).
 * @returns derived sequence count, N50 and L50 per accession.
 */
async function readNcbiContiguity(): Promise<
  Map<string, { l50: number; n50: number; sequences: number }>
> {
  const rows = await readValuesFile<Record<string, string>>(
    SOURCE_PATH_NCBI_CONTIGUITY,
    ",",
    ["accession", "sequences", "n50", "l50"]
  );
  return new Map(
    rows.map((row) => [
      row.accession,
      {
        l50: parseNumber(row.l50),
        n50: parseNumber(row.n50),
        sequences: parseNumber(row.sequences),
      },
    ])
  );
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
  const contiguityByAccession = await readNcbiContiguity();

  const mappedRows: HGAssemblyEntity[] = [];
  for (const row of sourceRows) {
    const contiguity = contiguityByAccession.get(row.accession);
    if (!contiguity)
      throw new Error(
        `No derived contiguity for ${row.accession} in ${SOURCE_PATH_NCBI_CONTIGUITY}`
      );
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
      scaffoldCount: contiguity.sequences,
      scaffoldL50: contiguity.l50,
      scaffoldN50: contiguity.n50,
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

  mappedRows.push(...(await buildExternalAssemblies(mappedRows)));

  const sortedRows = mappedRows.sort((a, b) =>
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
 * @returns external assembly entities.
 */
async function buildExternalAssemblies(
  ncbiRows: HGAssemblyEntity[]
): Promise<HGAssemblyEntity[]> {
  const { assemblies } = await readYamlFile<{
    assemblies: SourceExternalAssembly[];
  }>(SOURCE_PATH_EXTERNAL_ASSEMBLIES);
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
    maxScaffoldN50: getMaxDefined(organism?.maxScaffoldN50, genome.scaffoldN50),
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
