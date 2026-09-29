import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { NTagCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/NTagCell/nTagCell";
import {
  type ColumnConfig,
  type ComponentConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { type HGOrganismEntity } from "@highgen/apis/organism";
import { OrganismAvatar } from "@highgen/components/OrganismAvatar/organismAvatar";
import * as V from "@highgen/viewModelBuilders/viewModelBuilders";
import {
  buildAssemblyCount,
  buildOrganismAssemblyTaxonomyIds,
  buildOrganismTaxonomicGroup,
  buildTaxonomicLevelClass,
  buildTaxonomicLevelDomain,
  buildTaxonomicLevelFamily,
  buildTaxonomicLevelGenus,
  buildTaxonomicLevelKingdom,
  buildTaxonomicLevelOrder,
  buildTaxonomicLevelPhylum,
} from "@repo/shared/viewModelBuilders/viewModelBuilders";
import {
  HG_CATEGORY_KEY,
  HG_CATEGORY_LABEL,
} from "@site-config/highgen/category";

export const ASSEMBLY_COUNT: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildAssemblyCount,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.ASSEMBLY_COUNT,
  id: HG_CATEGORY_KEY.ASSEMBLY_COUNT,
  width: { max: "0.65fr", min: "164px" },
};

export const ASSEMBLY_TAXONOMY_IDS: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: NTagCell,
    viewBuilder: buildOrganismAssemblyTaxonomyIds,
  } as ComponentConfig<typeof NTagCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.ASSEMBLY_TAXONOMY_IDS,
  id: HG_CATEGORY_KEY.ASSEMBLY_TAXONOMY_IDS,
  width: { max: "0.65fr", min: "164px" },
};

export const TAXONOMIC_LEVEL_DOMAIN: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelDomain,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_DOMAIN,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_DOMAIN,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_KINGDOM: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelKingdom,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_KINGDOM,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_KINGDOM,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_PHYLUM: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelPhylum,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_PHYLUM,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_PHYLUM,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_CLASS: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelClass,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_CLASS,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_CLASS,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_ORDER: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelOrder,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_ORDER,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_ORDER,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_FAMILY: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelFamily,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_FAMILY,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_FAMILY,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_LEVEL_GENUS: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: BasicCell,
    viewBuilder: buildTaxonomicLevelGenus,
  } as ComponentConfig<typeof BasicCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_GENUS,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_GENUS,
  width: { max: "1fr", min: "200px" },
};

export const TAXONOMIC_GROUP: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: NTagCell,
    viewBuilder: buildOrganismTaxonomicGroup,
  } as ComponentConfig<typeof NTagCell, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_GROUP,
  id: HG_CATEGORY_KEY.TAXONOMIC_GROUP,
  width: { max: "0.65fr", min: "164px" },
};

export const TAXONOMIC_LEVEL_SPECIES: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: Link,
    viewBuilder: V.buildOrganismSpecies,
  } as ComponentConfig<typeof Link, HGOrganismEntity>,
  header: HG_CATEGORY_LABEL.TAXONOMIC_LEVEL_SPECIES,
  id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_SPECIES,
  meta: { columnPinned: true },
  width: { max: "1fr", min: "auto" },
};

export const ORGANISM_IMAGE: ColumnConfig<HGOrganismEntity> = {
  componentConfig: {
    component: OrganismAvatar,
    viewBuilder: V.buildOrganismImageThumbnail,
  } as ComponentConfig<typeof OrganismAvatar, HGOrganismEntity>,
  enableHiding: false,
  enableSorting: false,
  header: HG_CATEGORY_LABEL.ORGANISM_AVATAR,
  id: HG_CATEGORY_KEY.ORGANISM_AVATAR,
  width: "auto",
};
