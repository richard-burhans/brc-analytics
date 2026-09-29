import { BackPageContentSingleColumn } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import {
  type ComponentConfig,
  type ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { type HGOrganismEntity } from "@highgen/apis/organism";
import * as V from "@highgen/viewModelBuilders/viewModelBuilders";
import { Main as OrganismViewMain } from "@highgen/views/OrganismView/components/Main/main";
import { type WithWorkflowCategories } from "@repo/shared/services/staticGeneration/workflows/types";

export const organismMainColumn: ComponentsConfig = [
  {
    children: [
      {
        component: OrganismViewMain,
        viewBuilder: V.buildOrganismViewMain,
      },
    ],
    component: BackPageContentSingleColumn,
  } as ComponentConfig<
    typeof BackPageContentSingleColumn,
    WithWorkflowCategories<HGOrganismEntity>
  >,
];
