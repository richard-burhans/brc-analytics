import {
  type ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { type HGAssemblyEntity } from "@highgen/apis/assembly";
import { getAssemblyId, getAssemblyTitle } from "@highgen/apis/utils";
import { type AppEntityConfig } from "@repo/shared/config/types";
import { HG_CATEGORY_KEY } from "@site-config/highgen/category";
import { CATEGORY_GROUPS } from "./categoryGroups";
import { COLUMNS } from "./columns";

/**
 * Entity config object responsible to config anything related to the /assemblies route.
 */
export const genomeEntityConfig: AppEntityConfig<HGAssemblyEntity> = {
  categoryGroupConfig: {
    categoryGroups: CATEGORY_GROUPS,
    key: "assemblies",
  },
  detail: {
    detailOverviews: [],
    staticLoad: false,
    tabs: [],
  },
  exploreMode: EXPLORE_MODE.CS_FETCH_CS_FILTERING,
  getId: getAssemblyId,
  getTitle: getAssemblyTitle,
  label: "Assemblies",
  list: {
    columns: COLUMNS,
    tableOptions: {
      downloadFilename: "assemblies",
      enableTableDownload: true,
      initialState: {
        columnVisibility: {
          [HG_CATEGORY_KEY.TAXONOMIC_GROUP]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_STRAIN]: false,
          [HG_CATEGORY_KEY.TAXONOMY_ID]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_CLASS]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_FAMILY]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_GENUS]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_KINGDOM]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_ORDER]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_PHYLUM]: false,
          [HG_CATEGORY_KEY.TAXONOMIC_LEVEL_DOMAIN]: false,
        },
        sorting: [
          {
            desc: SORT_DIRECTION.ASCENDING,
            id: HG_CATEGORY_KEY.TAXONOMIC_LEVEL_SPECIES,
          },
        ],
      },
    },
  } as ListConfig<HGAssemblyEntity>,
  listView: {
    disablePagination: true,
  },
  route: "assemblies",
  staticLoadFile: "catalog/highgen/output/assemblies.json",
  ui: { title: "Assemblies" },
};
