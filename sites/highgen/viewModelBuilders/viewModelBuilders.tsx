import { type BackPageHero } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/components/BackPageHero/backPageHero";
import { type Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { type HGAssemblyEntity } from "@highgen/apis/assembly";
import { type HGOrganismEntity } from "@highgen/apis/organism";
import { type OrganismAvatar } from "@highgen/components/OrganismAvatar/organismAvatar";
import { type Main as OrganismViewMain } from "@highgen/views/OrganismView/components/Main/main";
import { sanitizeEntityId } from "@repo/shared/apis/utils";
import { ScientificName } from "@repo/shared/components/ScientificName/scientificName";
import { AnalyzeGenome } from "@repo/shared/components/Table/components/TableCell/components/AnalyzeGenome/analyzeGenome";
import { LevelCell } from "@repo/shared/components/Table/components/TableCell/components/LevelCell/levelCell";
import { TagList } from "@repo/shared/components/Table/components/TableCell/components/SpeciesCell/components/TagList/tagList";
import { SpeciesCell } from "@repo/shared/components/Table/components/TableCell/components/SpeciesCell/speciesCell";
import type { SpeciesTag } from "@repo/shared/components/Table/components/TableCell/components/SpeciesCell/types";
import { Tooltip } from "@repo/shared/components/Tooltip/tooltip";
import { ROUTES } from "@repo/shared/routes/constants";
import { type WithWorkflowCategories } from "@repo/shared/services/staticGeneration/workflows/types";
import { ORGANISM_SCOPED_TAG_LABELS } from "@repo/shared/viewModelBuilders/constants";
import {
  buildAnalyzeGenome,
  buildGroupTag,
  buildIsRef,
  buildLevel,
  buildReleaseDate,
  buildReleaseDateTooltip,
  formatNumber,
  getGenomeStrainText,
} from "@repo/shared/viewModelBuilders/viewModelBuilders";
import {
  COLUMN_PRESET_KEY,
  COLUMN_PRESET_LABEL,
} from "@repo/shared/views/OrganismView/components/Main/constants";
import {
  HG_CATEGORY_KEY,
  HG_CATEGORY_LABEL,
} from "@site-config/highgen/category";
import {
  type ColumnDef,
  type RowData,
  type VisibilityState,
} from "@tanstack/react-table";
import type { ComponentProps } from "react";

/**
 * Build props for the organism BackPageHero component.
 * @param entity - Entity.
 * @returns Props to be used for the BackPageHero component.
 */
export const buildOrganismHero = (
  entity: HGOrganismEntity
): ComponentProps<typeof BackPageHero> => {
  // The species/group are constant across the organism's assemblies, so surface
  // the group as a header chip rather than repeating it on every assembly row.
  const groupTag = buildGroupTag(entity.taxonomicGroup);
  return {
    breadcrumbs: [
      { path: ROUTES.ORGANISMS, text: "Organisms" },
      { path: "", text: entity.taxonomicLevelSpecies },
    ],
    subTitle: groupTag ? <TagList tags={[groupTag]} /> : undefined,
    // Deliberately not italicized: at hero scale the scientific-name italic
    // reads as styling rather than nomenclature (body-scale renders keep it).
    title: entity.taxonomicLevelSpecies,
  };
};

/**
 * Build props for the organism detail main content.
 * @param entity - HighGen organism entity.
 * @returns Props for the OrganismViewMain component.
 */
export const buildOrganismViewMain = (
  entity: WithWorkflowCategories<HGOrganismEntity>
): ComponentProps<typeof OrganismViewMain> => {
  return {
    assembly: {
      columnPresets: ORGANISM_GENOMES_COLUMN_PRESETS,
      tableOptions: buildOrganismGenomesTable(entity),
    },
    entityId: sanitizeEntityId(entity.ncbiTaxonomyId),
    workflowCategories: entity.workflowCategories,
  };
};

/**
 * Complete visibility state for the Default preset, also used as the table's
 * initial state. Columns not listed here are shown; the internal row-position
 * column is always hidden.
 */
const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
  [COLUMN_IDENTIFIER.ROW_POSITION]: false,
  [HG_CATEGORY_KEY.CHROMOSOMES]: false,
  [HG_CATEGORY_KEY.COVERAGE]: false,
  [HG_CATEGORY_KEY.GC_PERCENT]: false,
  [HG_CATEGORY_KEY.SCAFFOLD_COUNT]: false,
  [HG_CATEGORY_KEY.SCAFFOLD_L50]: false,
  [HG_CATEGORY_KEY.SCAFFOLD_N50]: false,
};

/**
 * The column presets (Default, Quality) for the organism genomes table. Each
 * preset's complete visibility state is applied via table.setColumnVisibility
 * on toggle; columns not listed are shown.
 */
const ORGANISM_GENOMES_COLUMN_PRESETS: ComponentProps<
  typeof OrganismViewMain
>["assembly"]["columnPresets"] = [
  {
    columnVisibility: DEFAULT_COLUMN_VISIBILITY,
    key: COLUMN_PRESET_KEY.DEFAULT,
    label: COLUMN_PRESET_LABEL.DEFAULT,
  },
  {
    columnVisibility: {
      [COLUMN_IDENTIFIER.ROW_POSITION]: false,
      [HG_CATEGORY_KEY.ANNOTATION_STATUS]: false,
      [HG_CATEGORY_KEY.IS_REF]: false,
      [HG_CATEGORY_KEY.LENGTH]: false,
      [HG_CATEGORY_KEY.RELEASE_DATE]: false,
    },
    key: COLUMN_PRESET_KEY.QUALITY,
    label: COLUMN_PRESET_LABEL.QUALITY,
  },
];

/**
 * Build props for the organism BackPageHero component.
 * @param entity - Entity.
 * @returns Props to be used for the BackPageHero component.
 */
export const buildOrganismImageThumbnail = (
  entity: HGOrganismEntity | HGAssemblyEntity
): ComponentProps<typeof OrganismAvatar> => {
  return {
    isThumbnail: true,
    thumbnailUrl: entity.thumbnailUrl,
  };
};

/**
 * Build table options (columns, data, initial state) for the genomes table for the given organism.
 * @param entity - Organism entity with genomes to be displayed in the table.
 * @returns table options.
 */
export function buildOrganismGenomesTable(
  entity: HGOrganismEntity
): ComponentProps<typeof OrganismViewMain>["assembly"]["tableOptions"] {
  return {
    // Cast: ColumnDef<T> is invariant in T, so the catalog-specific row type
    // cannot widen to RowData even though HGAssemblyEntity extends it.
    columns: buildOrganismGenomesTableColumns() as ColumnDef<RowData>[],
    data: entity.genomes,
    initialState: {
      // Mount on the Default preset so the table matches the toggle.
      columnVisibility: DEFAULT_COLUMN_VISIBILITY,
      sorting: [
        { desc: true, id: HG_CATEGORY_KEY.IS_REF },
        { desc: false, id: HG_CATEGORY_KEY.ACCESSION },
      ],
    },
  };
}

/**
 * Header for the pinned species column on the organism detail table: relabelled
 * "Assembly" since the cell's primary text is the assembly accession.
 */
const ASSEMBLY_COLUMN_HEADER = "Assembly";

/**
 * Build the column definitions for the organism genomes table.
 * @returns column definitions.
 */
function buildOrganismGenomesTableColumns(): ColumnDef<HGAssemblyEntity>[] {
  return [
    {
      accessorKey: HG_CATEGORY_KEY.ANALYZE_GENOME,
      cell: ({ row }) => (
        <AnalyzeGenome {...buildHgAnalyzeGenome(row.original)} />
      ),
      enableSorting: false,
      header: HG_CATEGORY_LABEL.ANALYZE_GENOME,
      meta: { header: HG_CATEGORY_LABEL.ANALYZE_GENOME, width: "auto" },
    },
    {
      // Keyed on accession so the pinned "Assembly" column sorts by accession
      // (its primary text); the SpeciesCell renders the accession + per-assembly
      // tags.
      accessorKey: HG_CATEGORY_KEY.ACCESSION,
      cell: ({ row }) => (
        <SpeciesCell {...buildOrganismAssemblySpecies(row.original)} />
      ),
      header: ASSEMBLY_COLUMN_HEADER,
      meta: {
        columnPinned: true,
        header: ASSEMBLY_COLUMN_HEADER,
        width: { max: "0.75fr", min: "176px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.RELEASE_DATE,
      cell: ({ row }) => (
        <Tooltip {...buildReleaseDateTooltip(row.original)}>
          <BasicCell {...buildReleaseDate(row.original)} />
        </Tooltip>
      ),
      header: HG_CATEGORY_LABEL.RELEASE_DATE,
      meta: {
        header: HG_CATEGORY_LABEL.RELEASE_DATE,
        width: { max: "1fr", min: "140px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.IS_REF,
      cell: ({ row }) => <ChipCell {...buildIsRef(row.original)} />,
      header: HG_CATEGORY_LABEL.IS_REF,
      meta: {
        header: HG_CATEGORY_LABEL.IS_REF,
        width: { max: "1fr", min: "100px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.LEVEL,
      cell: ({ row }) => <LevelCell {...buildLevel(row.original)} />,
      header: HG_CATEGORY_LABEL.LEVEL,
      meta: {
        header: HG_CATEGORY_LABEL.LEVEL,
        width: { max: "1fr", min: "152px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.CHROMOSOMES,
      header: HG_CATEGORY_LABEL.CHROMOSOMES,
      meta: {
        header: HG_CATEGORY_LABEL.CHROMOSOMES,
        width: { max: "1fr", min: "142px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.LENGTH,
      cell: ({ getValue }) => formatNumber(getValue()),
      header: HG_CATEGORY_LABEL.LENGTH,
      meta: {
        header: HG_CATEGORY_LABEL.LENGTH,
        width: { max: "1fr", min: "152px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.SCAFFOLD_COUNT,
      cell: ({ getValue }) => formatNumber(getValue()),
      header: HG_CATEGORY_LABEL.SCAFFOLD_COUNT,
      meta: {
        header: HG_CATEGORY_LABEL.SCAFFOLD_COUNT,
        width: { max: "1fr", min: "116px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.SCAFFOLD_N50,
      cell: ({ getValue }) => formatNumber(getValue()),
      header: HG_CATEGORY_LABEL.SCAFFOLD_N50,
      meta: {
        header: HG_CATEGORY_LABEL.SCAFFOLD_N50,
        width: { max: "1fr", min: "120px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.SCAFFOLD_L50,
      cell: ({ getValue }) => formatNumber(getValue()),
      header: HG_CATEGORY_LABEL.SCAFFOLD_L50,
      meta: {
        header: HG_CATEGORY_LABEL.SCAFFOLD_L50,
        width: { max: "1fr", min: "116px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.COVERAGE,
      header: HG_CATEGORY_LABEL.COVERAGE,
      meta: {
        header: HG_CATEGORY_LABEL.COVERAGE,
        width: { max: "1fr", min: "116px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.GC_PERCENT,
      header: HG_CATEGORY_LABEL.GC_PERCENT,
      meta: {
        header: HG_CATEGORY_LABEL.GC_PERCENT,
        width: { max: "1fr", min: "116px" },
      },
    },
    {
      accessorKey: HG_CATEGORY_KEY.ANNOTATION_STATUS,
      header: HG_CATEGORY_LABEL.ANNOTATION_STATUS,
      meta: {
        header: HG_CATEGORY_LABEL.ANNOTATION_STATUS,
        width: { max: "1fr", min: "140px" },
      },
    },
  ];
}

/**
 * Build props for the species cell.
 * @param entity - Organism entity.
 * @returns Props to be used for the cell.
 */
export const buildOrganismSpecies = (
  entity: HGOrganismEntity
): ComponentProps<typeof Link> => {
  return {
    label: <ScientificName>{entity.taxonomicLevelSpecies}</ScientificName>,
    url: `${ROUTES.ORGANISMS}/${sanitizeEntityId(entity.ncbiTaxonomyId)}`,
  };
};

/**
 * Build props for the consolidated species cell on the assembly list page.
 * Combines the species name and taxonomy id with the populated minor taxonomy
 * fields (strain, taxonomic group), each surfaced as a chip only when present.
 * HighGen assemblies have no serotype, isolate or priority pathogen.
 * @param entity - Assembly entity.
 * @returns Props to be used for the SpeciesCell component.
 */
export const buildAssemblySpecies = (
  entity: HGAssemblyEntity
): ComponentProps<typeof SpeciesCell> => {
  const tags: SpeciesTag[] = [];
  const strain = getGenomeStrainText(entity);
  if (strain) tags.push({ label: "strain", tooltip: strain, value: strain });
  const groupTag = buildGroupTag(entity.taxonomicGroup);
  if (groupTag) tags.push(groupTag);
  return {
    ncbiTaxonomyId: entity.ncbiTaxonomyId,
    species: {
      label: <ScientificName>{entity.taxonomicLevelSpecies}</ScientificName>,
      url: `${ROUTES.ORGANISMS}/${sanitizeEntityId(entity.speciesTaxonomyId)}`,
    },
    tags,
  };
};

/**
 * Build props for the species cell on the organism detail page assembly table.
 * The accession is the cell's primary (unlinked) label — the species name is
 * redundant on a single-organism page and moves to the hero title. The
 * organism-scoped group tag is dropped here as it moves to the hero; only
 * per-assembly tags (strain) remain.
 * @param entity - Assembly entity.
 * @returns Props to be used for the SpeciesCell component.
 */
export const buildOrganismAssemblySpecies = (
  entity: HGAssemblyEntity
): ComponentProps<typeof SpeciesCell> => {
  const props = buildAssemblySpecies(entity);
  return {
    ...props,
    // Accession replaces the species name as the cell's primary text (rendered
    // as plain text — no link). Organism-scoped tags move to the page header.
    species: { label: entity.accession, url: "" },
    tags: props.tags?.filter(
      ({ label }) => !ORGANISM_SCOPED_TAG_LABELS.includes(label)
    ),
  };
};

/**
 * Build props for the genome analysis cell. NCBI assemblies use the shared
 * builder; an assembly published elsewhere is catalogued without a Galaxy
 * launch, so Analyze is disabled and View links to its source and paper.
 * @param entity - Assembly entity.
 * @returns Props to be used for the AnalyzeGenome component.
 */
export const buildHgAnalyzeGenome = (
  entity: HGAssemblyEntity
): ComponentProps<typeof AnalyzeGenome> => {
  if (entity.source === "NCBI") return buildAnalyzeGenome(entity);
  return {
    analyze: { label: "Analyze", url: "" },
    views: [
      ...(entity.sourceUrl
        ? [{ label: entity.source, url: entity.sourceUrl }]
        : []),
      ...(entity.doi
        ? [{ label: "Publication", url: `https://doi.org/${entity.doi}` }]
        : []),
    ],
  };
};

/**
 * Build props for the source cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildSource = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: entity.source };
};

/**
 * Build props for the measured level cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildMeasuredLevel = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: entity.measuredLevel };
};

/**
 * Build props for the calculated contig n50 cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcContigN50 = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: formatNumber(entity.calcContigN50) };
};

/**
 * Build props for the calculated gc% cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
/**
 * Returns a calculated value for display, or an empty string when the source
 * reported the same field and the two agree, so only differences stand out.
 * @param entity - Assembly entity.
 * @param field - Reported field the calculated value is compared with.
 * @param reported - The reported value (null when the source reports none).
 * @param value - Calculated value, formatted for display.
 * @returns the value, or "" when it matches the reported one.
 */
function showIfDiffers(
  entity: HGAssemblyEntity,
  field: string,
  reported: number | null,
  value: string | number | null
): string | number | null {
  // A browser can pair this code with a cached catalog from before the field
  // existed; show the value rather than fail.
  const differs: string[] | undefined = entity.reportedDiffers;
  if (!differs) return value;
  if (reported !== null && !differs.includes(field)) return "";
  return value;
}

export const buildCalcGcPercent = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return {
    value: showIfDiffers(
      entity,
      "gcPercent",
      entity.gcPercent,
      entity.calcGcPercent
    ),
  };
};

/**
 * Build props for the calculated length cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcLength = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return {
    value: showIfDiffers(
      entity,
      "length",
      entity.length,
      formatNumber(entity.calcLength)
    ),
  };
};

/**
 * Build props for the calculated l50 cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcScaffoldL50 = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return {
    value: showIfDiffers(
      entity,
      "scaffoldL50",
      entity.scaffoldL50,
      formatNumber(entity.calcScaffoldL50)
    ),
  };
};

/**
 * Build props for the calculated n50 cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcScaffoldN50 = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return {
    value: showIfDiffers(
      entity,
      "scaffoldN50",
      entity.scaffoldN50,
      formatNumber(entity.calcScaffoldN50)
    ),
  };
};

/**
 * Build props for the calculated sequences cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcSequences = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return {
    value: showIfDiffers(
      entity,
      "scaffoldCount",
      entity.scaffoldCount,
      formatNumber(entity.calcSequences)
    ),
  };
};

/**
 * Build props for the top-10 share cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildCalcTop10Frac = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: `${(entity.calcTop10Frac * 100).toFixed(1)}%` };
};

/**
 * Build props for the reported vs calculated cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildReportedVsCalculated = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: entity.reportedVsCalculated };
};

/**
 * Build props for the differences cell.
 * @param entity - Assembly entity.
 * @returns Props for the BasicCell component.
 */
export const buildReportedVsCalculatedDetail = (
  entity: HGAssemblyEntity
): ComponentProps<typeof BasicCell> => {
  return { value: entity.reportedVsCalculatedDetail };
};
