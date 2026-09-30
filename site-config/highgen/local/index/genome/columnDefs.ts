import { BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { NTagCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/NTagCell/nTagCell";
import {
  type ColumnConfig,
  type ComponentConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { type HGAssemblyEntity } from "@highgen/apis/assembly";
import { OrganismAvatar } from "@highgen/components/OrganismAvatar/organismAvatar";
import * as V from "@highgen/viewModelBuilders/viewModelBuilders";
import { AnalyzeGenome } from "@repo/shared/components/Table/components/TableCell/components/AnalyzeGenome/analyzeGenome";
import { LevelCell } from "@repo/shared/components/Table/components/TableCell/components/LevelCell/levelCell";
import { SpeciesCell } from "@repo/shared/components/Table/components/TableCell/components/SpeciesCell/speciesCell";
import { Tooltip } from "@repo/shared/components/Tooltip/tooltip";
import {
  buildAccession,
  buildAnnotationStatus,
  buildAssemblyTaxonomicGroup,
  buildChromosomes,
  buildCoverage,
  buildGcPercent,
  buildGenomeTaxonomicLevelStrain,
  buildIsRef,
  buildLength,
  buildLevel,
  buildReleaseDate,
  buildReleaseDateTooltip,
  buildScaffoldCount,
  buildScaffoldL50,
  buildScaffoldN50,
  buildTaxonomicLevelClass,
  buildTaxonomicLevelDomain,
  buildTaxonomicLevelFamily,
  buildTaxonomicLevelGenus,
  buildTaxonomicLevelKingdom,
  buildTaxonomicLevelOrder,
  buildTaxonomicLevelPhylum,
  buildTaxonomyId,
} from "@repo/shared/viewModelBuilders/viewModelBuilders";
import {
  HG_CATEGORY_KEY,
  HG_CATEGORY_LABEL,
} from "@site-config/highgen/category";

export const ACCESSION: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildAccession,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.ACCESSION,
  id: HG_CATEGORY_KEY.ACCESSION,
  width: { max: "1fr", min: "164px" },
};

export const ANALYZE_GENOME: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: AnalyzeGenome,
    viewBuilder: V.buildHgAnalyzeGenome,
  } as ComponentConfig<typeof AnalyzeGenome, HGAssemblyEntity>,
  enableSorting: false,
  enableTableDownload: false,
  header: HG_CATEGORY_LABEL.ANALYZE_GENOME,
  id: HG_CATEGORY_KEY.ANALYZE_GENOME,
  width: "auto",
};

export const ANNOTATION_STATUS: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildAnnotationStatus,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.ANNOTATION_STATUS,
  id: HG_CATEGORY_KEY.ANNOTATION_STATUS,
  width: { max: "0.5fr", min: "180px" },
};

export const CHROMOSOMES: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildChromosomes,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.CHROMOSOMES,
  id: HG_CATEGORY_KEY.CHROMOSOMES,
  width: { max: "0.5fr", min: "142px" },
};

export const COVERAGE: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildCoverage,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.COVERAGE,
  id: HG_CATEGORY_KEY.COVERAGE,
  width: { max: "0.5fr", min: "100px" },
};

export const GC_PERCENT: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildGcPercent,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.GC_PERCENT,
  id: HG_CATEGORY_KEY.GC_PERCENT,
  width: { max: "0.5fr", min: "100px" },
};

export const IS_REF: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: ChipCell,
    viewBuilder: buildIsRef,
  } as ComponentConfig<typeof ChipCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.IS_REF,
  id: HG_CATEGORY_KEY.IS_REF,
  width: { max: "0.5fr", min: "100px" },
};

export const LENGTH: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildLength,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.LENGTH,
  id: HG_CATEGORY_KEY.LENGTH,
  width: { max: "0.5fr", min: "132px" },
};

export const LEVEL: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: LevelCell,
    viewBuilder: buildLevel,
  } as ComponentConfig<typeof LevelCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.LEVEL,
  id: HG_CATEGORY_KEY.LEVEL,
  width: { max: "0.5fr", min: "142px" },
};

export const MEASURED_LEVEL: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: V.buildMeasuredLevel,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.MEASURED_LEVEL,
  id: HG_CATEGORY_KEY.MEASURED_LEVEL,
  width: { max: "0.5fr", min: "160px" },
};

export const RELEASE_DATE: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    children: [
      {
        component: BasicCell,
        viewBuilder: buildReleaseDate,
      } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
    ],
    component: Tooltip,
    viewBuilder: buildReleaseDateTooltip,
    // The shared release-date builders take the site-neutral AssemblyContract,
    // which TS can't reconcile with this cast: ComponentConfig's data type is
    // invariant and the Tooltip viewBuilder omits `children` (supplied above).
    // Double cast is the repo's escape-hatch for this findable-ui limitation.
  } as unknown as ComponentConfig<typeof Tooltip, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.RELEASE_DATE,
  id: HG_CATEGORY_KEY.RELEASE_DATE,
  width: { max: "1fr", min: "120px" },
};

export const SCAFFOLD_COUNT: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildScaffoldCount,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.SCAFFOLD_COUNT,
  id: HG_CATEGORY_KEY.SCAFFOLD_COUNT,
  width: { max: "0.5fr", min: "120px" },
};

export const SCAFFOLD_L50: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildScaffoldL50,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.SCAFFOLD_L50,
  id: HG_CATEGORY_KEY.SCAFFOLD_L50,
  width: { max: "0.5fr", min: "120px" },
};

export const SCAFFOLD_N50: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildScaffoldN50,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.SCAFFOLD_N50,
  id: HG_CATEGORY_KEY.SCAFFOLD_N50,
  width: { max: "0.5fr", min: "120px" },
};

export const SOURCE: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: V.buildSource,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.SOURCE,
  id: HG_CATEGORY_KEY.SOURCE,
  width: { max: "1fr", min: "180px" },
};

export const TAXONOMIC_LEVEL_DOMAIN: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelDomain,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_DOMAIN,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_DOMAIN,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_KINGDOM: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelKingdom,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_KINGDOM,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_KINGDOM,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_PHYLUM: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelPhylum,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_PHYLUM,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_PHYLUM,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_CLASS: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelClass,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_CLASS,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_CLASS,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_ORDER: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelOrder,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_ORDER,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_ORDER,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_FAMILY: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelFamily,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_FAMILY,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_FAMILY,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_GENUS: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelGenus,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_GENUS,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_GENUS,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_GROUP: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: NTagCell,
    viewBuilder: buildAssemblyTaxonomicGroup,
  } as ComponentConfig<typeof NTagCell, HGAssemblyEntity>,
  enableHiding: false,
  header: HG_CATEGORY_LABEL.TAXONOMIC_GROUP,
  id: HG_CATEGORY_KEY.TAXONOMIC_GROUP,
  width: { max: "0.5fr", min: "142px" },
};

export const TAXONOMIC_LEVEL_SPECIES: ColumnConfig<HGAssemblyEntity> = {
  columnPinned: true,
  componentConfig: {
    component: SpeciesCell,
    viewBuilder: V.buildAssemblySpecies,
  } as ComponentConfig<typeof SpeciesCell, HGAssemblyEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_SPECIES,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_SPECIES,
  width: { max: "1.5fr", min: "340px" },
};

export const TAXONOMIC_LEVEL_STRAIN: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildGenomeTaxonomicLevelStrain,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  enableHiding: false,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_STRAIN,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_STRAIN,
  width: { max: "0.5fr", min: "160px" },
};

export const TAXONOMY_ID: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomyId,
  } as ComponentConfig<typeof BasicCell, HGAssemblyEntity>,
  enableHiding: false,
  header: HG_CATEGORY_LABEL.TAXONOMY_ID,
  id: HG_CATEGORY_KEY.TAXONOMY_ID,
  width: { max: "0.5fr", min: "144px" },
};

export const ORGANISM_IMAGE: ColumnConfig<HGAssemblyEntity> = {
  componentConfig: {
    component: OrganismAvatar,
    viewBuilder: V.buildOrganismImageThumbnail,
  } as ComponentConfig<typeof OrganismAvatar, HGAssemblyEntity>,
  enableHiding: false,
  enableSorting: false,
  header: HG_CATEGORY_LABEL.ORGANISM_AVATAR,
  id: HG_CATEGORY_KEY.ORGANISM_AVATAR,
  width: "auto",
};
