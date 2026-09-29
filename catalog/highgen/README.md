# HighGen catalog directory

This directory provides the catalog data that is presented by the HighGen app (public _Cannabis sativa_ genome assemblies). Some relevant information may be present in the analogous [BRC Analytics catalog readme](../README.md).

Similar to the BRC Analytics catalog, the HighGen catalog is built using two main commands:

```
npm run build-highgen-from-ncbi
npm run build-highgen-db
```

`build-highgen-db` reads BRC's `catalog/output/workflows.json`, so the BRC workflows must be current first.

## Sources

- `source/assemblies.yml` — NCBI accessions (GCA/GCF). Suppressed records are left out.
- `source/organisms.yml` — one entry per species taxonomy ID with its ploidy.
- `source/organism_image_data.json` — credit and licence for each organism image.

## Organism images

Unlike GA2, HighGen commits its organism images (`sites/highgen/public/organism_image/<Species>_1024x1024.jpg` and `_300x300.jpg`) rather than fetching them from a bucket. The build falls back to `missing_image.png` for a species with no image.

## Galaxy datacache

No Galaxy datacache tree exists for cannabis yet, so `galaxyDatacacheUrl` is empty and workflows that need `ASSEMBLY_ID` (RNA-seq, ChIP-seq, ATAC-seq, Hi-C) are not offered.
