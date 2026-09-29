from ....py_package.catalog_build import build_files

ASSEMBLIES_PATH = "catalog/highgen/source/assemblies.yml"

ORGANISMS_PATH = "catalog/highgen/source/organisms.yml"

UCSC_ASSEMBLIES_URL = "https://hgdownload.soe.ucsc.edu/hubs/plants/assemblyList.json"

GENOMES_OUTPUT_PATH = "catalog/highgen/build/intermediate/genomes-from-ncbi.tsv"

ORGANISM_IMAGE_PATH = "sites/highgen/public/organism_image"

ORGANISM_IMAGE_INFO_PATH = "catalog/highgen/source/organism_image_data.json"

BUILD_META_OUTPUT_PATH = "catalog/highgen/output/data-build-meta.json"

QC_REPORT_PATH = "catalog/highgen/output/qc-report.data.md"

TREE_OUTPUT_PATH = "catalog/highgen/output/ncbi-taxa-tree.json"

TEMP_FOLDER_PATH = "catalog/highgen/build/temp"

TAXONOMIC_GROUPS_BY_TAXONOMY_ID = {
    3481: "Cannabaceae",
}

# TAXONOMIC_LEVELS_FOR_TREE should be listed in order, as the order is used in
# building the taxonomy tree; higher-level categories should be listed earlier
# than lower-level categories
TAXANOMIC_LEVELS_FOR_TREE = [
    "domain",
    "kingdom",
    "phylum",
    "class",
    "order",
    "family",
    "genus",
    "species",
    "strain",
]

# Darwin Tree of Life prefixes; "d" is dicotyledons
TOLIDS_BY_TAXONOMY_ID = {
    3398: "d",  # Magnoliopsida
}


def build_ncbi_data():
    build_files(
        ASSEMBLIES_PATH,
        GENOMES_OUTPUT_PATH,
        UCSC_ASSEMBLIES_URL,
        TREE_OUTPUT_PATH,
        TAXANOMIC_LEVELS_FOR_TREE,
        taxonomic_group_sets={
            "taxonomicGroup": TAXONOMIC_GROUPS_BY_TAXONOMY_ID,
            "tolId": TOLIDS_BY_TAXONOMY_ID,
        },
        temp_folder_path=TEMP_FOLDER_PATH,
        dlt_pipeline_prefix="highgen_catalog_",
        do_gene_model_urls=True,
        organisms_path=ORGANISMS_PATH,
        build_meta_output_path=BUILD_META_OUTPUT_PATH,
        qc_report_path=QC_REPORT_PATH,
        organism_image_path=ORGANISM_IMAGE_PATH,
        organism_image_source_information_path=ORGANISM_IMAGE_INFO_PATH,
        # No Galaxy datacache tree exists for cannabis yet (only brc/ and vgp/)
        datacache_base_url=None,
    )


if __name__ == "__main__":
    build_ncbi_data()
