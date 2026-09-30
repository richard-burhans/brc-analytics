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

## Reported and calculated statistics

The "Reported" columns show what each source says: NCBI's assembly-level record for NCBI assemblies (including its known errors, such as contig values in the scaffold fields for Purple Kush GCA_000230575.5 and Finola GCA_003417725.2), and the survey inventory's values for external ones (Salk's are BUSCO's N50s, truncated to whole megabases).

The "Calculated" columns come from `source/measured_assembly_stats.tsv`, written by `build/py/measure_assemblies.py`, which streams every assembly's FASTA once:

```
python3 -m catalog.highgen.build.py.measure_assemblies \
  --inventory <cannabis-genome>/data/processed/genome_inventory.json \
  --data-root <directory the inventory's on_disk paths are relative to> \
  --ncbi-dir <directory of NCBI <acc>_genomic.fna.gz and <acc>_assembly_report.txt> \
  --jobs 16
python3 -m catalog.highgen.build.py.measure_assemblies --self-test
```

NCBI assemblies are measured over the Primary Assembly unit only; organelles and alternate haplotypes are counted as excluded. Contigs are split at runs of 10 or more N. An interrupted run resumes from `build/temp/`. The build fails if any assembly has no measurement.

`build-catalog.ts` compares the two: N50, sequence count and length must match exactly (a truncated Salk N50 agrees when the calculated N50 is within the following megabase), and GC% within 0.25 points (NCBI rounds to the nearest 0.5). The result is shown as "Reported vs Calculated" (Agrees, Differs or Not reported) with the differences spelled out.

## Declared and measured level

`level` (shown as "Declared Level") is the level the submitter declared: NCBI's `assembly_level` for NCBI assemblies, and the survey inventory's recorded level for external ones. `measuredLevel` is computed in `build-catalog.ts` from the calculated scaffold N50: Chromosome-scale at 50 Mb or more (cannabis chromosomes in cs10 are 61.6 to 105 Mb), Megabase-scale from 1 Mb, and Kilobase-scale below that. The two are shown side by side to decide how Level should be defined.

## External assemblies

`source/external_assemblies.yml` lists the assemblies with no NCBI record (the Salk pangenome on figshare, NGDC Genome Warehouse, CoGe and GigaDB). It is generated from the cannabis-genome survey's `data/processed/genome_inventory.json`; regenerate it with:

```
npm run build-highgen-external -- --inventory <path to genome_inventory.json>
```

Only the inventory's canonical assemblies are included, so its duplicate records of NCBI assemblies (Zenodo, Ensembl Plants) are left out. External assemblies are catalogued without a Galaxy launch: their `fastaUrl` is null, so workflows that take the assembly FASTA are not offered, and the Analyze button is disabled.

## Assembly FASTA

The workflow launch hands Galaxy the UCSC GenArk FASTA for an accession. `build-catalog.ts` sets `fastaUrl` only when GenArk holds the assembly under that exact accession; for other assemblies FASTA workflows are not offered.

## Organism images

Unlike GA2, HighGen commits its organism images (`sites/highgen/public/organism_image/<Species>_1024x1024.jpg` and `_300x300.jpg`) rather than fetching them from a bucket. The build falls back to `missing_image.png` for a species with no image.

## Galaxy datacache

No Galaxy datacache tree exists for cannabis yet, so `galaxyDatacacheUrl` is empty and workflows that need `ASSEMBLY_ID` (RNA-seq, ChIP-seq, ATAC-seq, Hi-C) are not offered.
