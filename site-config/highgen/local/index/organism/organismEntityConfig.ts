import {
  type ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { type HGOrganismEntity } from "@highgen/apis/organism";
import { getOrganismId } from "@highgen/apis/utils";
import { type AppEntityConfig } from "@repo/shared/config/types";
import { HG_CATEGORY_KEY } from "@site-config/highgen/category";
import { organismMainColumn } from "@site-config/highgen/local/entity/organism/organismMainColumn";
import { organismTop } from "@site-config/highgen/local/entity/organism/organismTop";
import { CATEGORY_GROUPS } from "./categoryGroups";
import { COLUMNS } from "./columns";

/**
 * Entity config object responsible to config anything related to the /organisms route.
 */
export const organismEntityConfig: AppEntityConfig<HGOrganismEntity> = {
  categoryGroupConfig: {
    categoryGroups: CATEGORY_GROUPS,
    key: "organisms",
  },
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [
      {
        label: "Organism",
        mainColumn: organismMainColumn,
        route: "",
        top: organismTop,
      },
    ],
  },
  exploreMode: EXPLORE_MODE.CS_FETCH_CS_FILTERING,
  getId: getOrganismId,
  label: "Organisms",
  list: {
    columns: COLUMNS,
    tableOptions: {
      downloadFilename: "organisms",
      enableTableDownload: true,
      initialState: {
        columnVisibility: {
          [HG_CATEGORY_KEY.TAXONOMIC_GROUP]: false,
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
  } as ListConfig<HGOrganismEntity>,
  listView: {
    disablePagination: true,
  },
  route: "organisms",
  staticLoadFile: "catalog/highgen/output/organisms.json",
  ui: { title: "Organisms" },
};
