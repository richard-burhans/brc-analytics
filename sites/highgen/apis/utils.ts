import { sanitizeEntityId } from "@repo/shared/apis/utils";
import { type WorkflowEntity } from "@repo/shared/views/WorkflowsView/types";
import { formatTrsId } from "@repo/shared/workflow/utils";
import { type HGAssemblyEntity } from "./assembly";
import { type HGOrganismEntity } from "./organism";

/**
 * Get the ID of the given assembly entity.
 * @param entity - Entity.
 * @returns entity ID.
 */
export function getAssemblyId(entity?: HGAssemblyEntity): string {
  return sanitizeEntityId(entity?.accession);
}

/**
 * Get the title of the given assembly entity.
 * @param entity - Entity.
 * @returns entity title.
 */
export function getAssemblyTitle(entity?: HGAssemblyEntity): string {
  return entity?.taxonomicLevelSpecies || "";
}

/**
 * Get the ID of the given organism entity.
 * @param entity - Entity.
 * @returns entity ID.
 */
export function getOrganismId(entity?: HGOrganismEntity): string {
  return entity?.ncbiTaxonomyId || "";
}

/**
 * Get the ID of the workflow entity.
 * @param workflow - Workflow.
 * @returns workflow ID.
 */
export function getWorkflowId(workflow: WorkflowEntity): string {
  return formatTrsId(workflow.trsId);
}
