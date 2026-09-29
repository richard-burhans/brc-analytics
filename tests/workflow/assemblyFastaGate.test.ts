import {
  ORGANISM_PLOIDY,
  WORKFLOW_PARAMETER_VARIABLE,
  WORKFLOW_PLOIDY,
  WORKFLOW_SCOPE,
} from "@repo/shared/apis/schema-types";
import type { AssemblyContract } from "@repo/shared/apis/types";
import type { Workflow } from "@repo/shared/apis/workflow";
import { workflowIsCompatibleWithAssembly } from "@repo/shared/views/AnalyzeWorkflowsView/components/Main/utils";

function buildWorkflow(variables: WORKFLOW_PARAMETER_VARIABLE[]): Workflow {
  return {
    assemblyCountMax: null,
    assemblyCountMin: 1,
    iwcId: "test",
    parameters: variables.map((variable) => ({ key: variable, variable })),
    ploidy: WORKFLOW_PLOIDY.ANY,
    scope: WORKFLOW_SCOPE.ASSEMBLY,
    taxonomyId: null,
    trsId: "#workflow/test",
    workflowDescription: "",
    workflowName: "Test",
  };
}

function buildAssembly(
  fastaUrl: AssemblyContract["fastaUrl"] | "absent"
): AssemblyContract {
  const assembly = {
    accession: "GCA_000000001.1",
    galaxyDatacacheUrl: null,
    lineageTaxonomyIds: ["3483"],
    ploidy: [ORGANISM_PLOIDY.DIPLOID],
  } as unknown as AssemblyContract;
  if (fastaUrl !== "absent") assembly.fastaUrl = fastaUrl;
  return assembly;
}

describe("workflowIsCompatibleWithAssembly - assembly FASTA gate", () => {
  const FASTA_WORKFLOW = buildWorkflow([
    WORKFLOW_PARAMETER_VARIABLE.ASSEMBLY_FASTA_URL,
  ]);
  const NO_FASTA_WORKFLOW = buildWorkflow([
    WORKFLOW_PARAMETER_VARIABLE.SANGER_READ_RUN_SINGLE,
  ]);

  it("rejects a FASTA workflow when the catalog records no FASTA", () => {
    expect(
      workflowIsCompatibleWithAssembly(FASTA_WORKFLOW, buildAssembly(null))
    ).toBe(false);
  });

  it("accepts a FASTA workflow when the assembly has a FASTA URL", () => {
    expect(
      workflowIsCompatibleWithAssembly(
        FASTA_WORKFLOW,
        buildAssembly("https://example.org/a.fa.gz")
      )
    ).toBe(true);
  });

  it("accepts a FASTA workflow when the catalog does not track FASTAs", () => {
    // BRC and GA2 assemblies have no fastaUrl field; their behaviour must not change.
    expect(
      workflowIsCompatibleWithAssembly(FASTA_WORKFLOW, buildAssembly("absent"))
    ).toBe(true);
  });

  it("accepts a workflow that does not take the assembly FASTA", () => {
    expect(
      workflowIsCompatibleWithAssembly(NO_FASTA_WORKFLOW, buildAssembly(null))
    ).toBe(true);
  });
});
