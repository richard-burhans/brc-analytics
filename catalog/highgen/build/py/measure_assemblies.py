"""Measure every HighGen assembly from its FASTA, for comparison with reported values.

Streams each assembly's FASTA once and writes
catalog/highgen/source/measured_assembly_stats.tsv with sequence count, length,
gaps, GC, soft-masked share, scaffold N50/L50/N90, largest sequence, the share
of sequence in the ten largest, and contig N50/L50.

Sources:
  NCBI assemblies: <ncbi-dir>/<accession>_genomic.fna.gz, restricted to the
    Primary Assembly unit listed in <ncbi-dir>/<accession>_assembly_report.txt
    (organelles and alternate haplotypes are counted as excluded, not measured).
  External assemblies: the file named by `files.on_disk` in the cannabis-genome
    inventory, resolved against --data-root. A .tar.gz is streamed and its
    genome member (<label>.softmasked.fasta.gz) read without extracting.

Contigs are sequences split at runs of 10 or more N, as QUAST does.
GC is (G+C)/(A+C+G+T), so gaps and other IUPAC codes do not dilute it.

Usage:
  python3 -m catalog.highgen.build.py.measure_assemblies \
    --inventory ../cannabis-genome/data/processed/genome_inventory.json \
    --data-root /path/to/bench --ncbi-dir /path/to/ncbi_fasta --jobs 8
  python3 -m catalog.highgen.build.py.measure_assemblies --self-test
"""

import argparse
import csv
import gzip
import io
import json
import os
import re
import sys
import tarfile
from multiprocessing import Pool

import yaml

ASSEMBLIES_PATH = "catalog/highgen/source/assemblies.yml"
EXTERNAL_PATH = "catalog/highgen/source/external_assemblies.yml"
OUTPUT_PATH = "catalog/highgen/source/measured_assembly_stats.tsv"

PROGRESS_PATH = "catalog/highgen/build/temp/measured_assembly_stats.partial.tsv"

GAP_RUN = re.compile(rb"[Nn]{10,}")

COLUMNS = [
    "accession",
    "source_file",
    "sequences",
    "total_bp",
    "gap_bp",
    "gc_percent",
    "softmasked_percent",
    "scaffold_n50",
    "scaffold_l50",
    "scaffold_n90",
    "largest",
    "top10_frac",
    "contigs",
    "contig_n50",
    "contig_l50",
    "excluded_sequences",
    "excluded_bp",
]


def nx(lengths, fraction):
    """Return (Nx, Lx) for a list of lengths: the length and count at which the
    running total of lengths sorted largest first reaches `fraction` of the sum."""
    ordered = sorted(lengths, reverse=True)
    target = sum(ordered) * fraction
    running = 0
    for i, length in enumerate(ordered, 1):
        running += length
        if running >= target:
            return length, i
    return 0, 0


def iter_fasta(stream):
    """Yield (name, sequence bytes) from a binary FASTA stream."""
    name, parts = None, []
    for line in stream:
        if line.startswith(b">"):
            if name is not None:
                yield name, b"".join(parts)
            name, parts = line[1:].split(None, 1)[0].decode(), []
        else:
            parts.append(line.strip())
    if name is not None:
        yield name, b"".join(parts)


def measure(records, keep=None):
    """Measure (name, sequence) records; `keep` restricts to a set of names."""
    lengths, contig_lengths = [], []
    gap = gc = acgt = soft = 0
    excluded_seqs = excluded_bp = 0
    for name, seq in records:
        if keep is not None and name not in keep:
            excluded_seqs += 1
            excluded_bp += len(seq)
            continue
        lengths.append(len(seq))
        g_c = seq.count(b"G") + seq.count(b"C") + seq.count(b"g") + seq.count(b"c")
        a_t = seq.count(b"A") + seq.count(b"T") + seq.count(b"a") + seq.count(b"t")
        gc += g_c
        acgt += g_c + a_t
        soft += seq.count(b"a") + seq.count(b"c") + seq.count(b"g") + seq.count(b"t")
        gap += seq.count(b"N") + seq.count(b"n")
        start = 0
        for m in GAP_RUN.finditer(seq):
            if m.start() > start:
                contig_lengths.append(m.start() - start)
            start = m.end()
        if len(seq) > start:
            contig_lengths.append(len(seq) - start)
    total = sum(lengths)
    n50, l50 = nx(lengths, 0.5)
    n90, _ = nx(lengths, 0.9)
    c50, cl50 = nx(contig_lengths, 0.5)
    top10 = sum(sorted(lengths, reverse=True)[:10])
    return {
        "sequences": len(lengths),
        "total_bp": total,
        "gap_bp": gap,
        "gc_percent": round(100 * gc / acgt, 2) if acgt else "",
        "softmasked_percent": round(100 * soft / acgt, 2) if acgt else "",
        "scaffold_n50": n50,
        "scaffold_l50": l50,
        "scaffold_n90": n90,
        "largest": max(lengths) if lengths else 0,
        "top10_frac": round(top10 / total, 4) if total else "",
        "contigs": len(contig_lengths),
        "contig_n50": c50,
        "contig_l50": cl50,
        "excluded_sequences": excluded_seqs,
        "excluded_bp": excluded_bp,
    }


def primary_names(report_path):
    """Sequence accessions in the Primary Assembly unit of an NCBI assembly report."""
    names = set()
    with open(report_path) as f:
        for line in f:
            if line.startswith("#"):
                continue
            cols = line.rstrip("\n").split("\t")
            if len(cols) >= 8 and cols[7] == "Primary Assembly":
                names.update(c for c in (cols[4], cols[6]) if c and c != "na")
    return names


def open_fasta(path):
    """Open a FASTA (plain or .gz) or the genome member of a .tar.gz, as bytes lines."""
    if path.endswith((".tar.gz", ".tgz")):
        tf = tarfile.open(path, mode="r|gz")
        for member in tf:
            if member.name.endswith(".softmasked.fasta.gz"):
                return io.BufferedReader(gzip.GzipFile(fileobj=tf.extractfile(member)))
        raise FileNotFoundError(f"no .softmasked.fasta.gz member in {path}")
    if path.endswith(".gz"):
        return io.BufferedReader(gzip.GzipFile(path))
    return open(path, "rb")


def run_task(task):
    """Measure one assembly; returns its row, or an error row."""
    accession, path, report = task
    try:
        keep = primary_names(report) if report else None
        with open_fasta(path) as stream:
            stats = measure(iter_fasta(stream), keep)
        if keep is not None and stats["sequences"] == 0:
            raise ValueError("no Primary Assembly sequences matched the FASTA headers")
        return {"accession": accession, "source_file": os.path.basename(path), **stats}
    except Exception as e:  # noqa: BLE001
        return {
            "accession": accession,
            "source_file": os.path.basename(path),
            "error": str(e),
        }


def build_tasks(inventory_path, data_root, ncbi_dir):
    """One (catalog accession, FASTA path, assembly report or None) per catalog row."""
    tasks = []
    with open(ASSEMBLIES_PATH) as f:
        for entry in yaml.safe_load(f)["assemblies"]:
            acc = entry["accession"]
            tasks.append(
                (
                    acc,
                    os.path.join(ncbi_dir, f"{acc}_genomic.fna.gz"),
                    os.path.join(ncbi_dir, f"{acc}_assembly_report.txt"),
                )
            )
    with open(inventory_path) as f:
        rows = {r["id"]: r for r in json.load(f)["assemblies"]}
    with open(EXTERNAL_PATH) as f:
        for entry in yaml.safe_load(f)["assemblies"]:
            on_disk = rows[entry["inventory_id"]]["files"]["on_disk"]
            tasks.append((entry["id"], os.path.join(data_root, on_disk), None))
    return tasks


def self_test():
    """Check the measurements on a small FASTA with known answers."""
    fasta = (
        b">chr1 first\nACGTACGTAC\nGTNNNNNNNNNNacgt\n"  # 26 bp, 10 N, contigs 12 and 4
        b">chr2\nGGGGCCCCAA\n"  # 10 bp
        b">mito\nAAAA\n"  # excluded
    )
    stats = measure(iter_fasta(io.BytesIO(fasta)), keep={"chr1", "chr2"})
    expected = {
        "sequences": 2,
        "total_bp": 36,
        "gap_bp": 10,
        "scaffold_n50": 26,
        "scaffold_l50": 1,
        "largest": 26,
        "contigs": 3,
        "contig_n50": 10,  # contigs 12, 10, 4: half of 26 is reached at 10
        "contig_l50": 2,
        "excluded_sequences": 1,
        "excluded_bp": 4,
        "gc_percent": round(100 * 16 / 26, 2),  # 6 + 2 + 8 GC of 26 non-N
        "softmasked_percent": round(100 * 4 / 26, 2),
        "top10_frac": 1.0,
    }
    bad = {k: (stats[k], v) for k, v in expected.items() if stats[k] != v}
    if bad:
        sys.exit(f"self-test FAILED: {bad}")
    assert nx([5, 3, 2], 0.5) == (5, 1) and nx([4, 4, 2], 0.5) == (4, 2)
    print("self-test passed")


def main():
    parser = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    parser.add_argument("--inventory")
    parser.add_argument("--data-root")
    parser.add_argument("--ncbi-dir")
    parser.add_argument("--jobs", type=int, default=8)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not (args.inventory and args.data_root and args.ncbi_dir):
        parser.error("--inventory, --data-root and --ncbi-dir are required")
    tasks = build_tasks(args.inventory, args.data_root, args.ncbi_dir)
    missing = [t[1] for t in tasks if not os.path.exists(t[1])]
    if missing:
        sys.exit(f"{len(missing)} FASTA files missing, e.g. {missing[:3]}")
    # Finished rows are appended to a progress file so an interrupted run resumes
    # where it stopped instead of re-reading every FASTA.
    done = {}
    if os.path.exists(PROGRESS_PATH):
        with open(PROGRESS_PATH, newline="") as f:
            done = {r["accession"]: r for r in csv.DictReader(f, delimiter="\t")}
    todo = [t for t in tasks if t[0] not in done]
    print(f"{len(done)} already measured, {len(todo)} to go", flush=True)
    os.makedirs(os.path.dirname(PROGRESS_PATH), exist_ok=True)
    new_file = not os.path.exists(PROGRESS_PATH)
    errors = []
    with open(PROGRESS_PATH, "a", newline="") as progress, Pool(args.jobs) as pool:
        writer = csv.DictWriter(progress, fieldnames=COLUMNS, delimiter="\t")
        if new_file:
            writer.writeheader()
        for i, row in enumerate(pool.imap_unordered(run_task, todo), 1):
            if "error" in row:
                errors.append(row)
            else:
                writer.writerow(row)
                progress.flush()
                done[row["accession"]] = row
            print(
                f"{i}/{len(todo)} {row['accession']} {row.get('error', 'ok')}",
                flush=True,
            )
    if errors:
        sys.exit(f"{len(errors)} assemblies failed: {errors[:3]}")
    wanted = {t[0] for t in tasks}
    rows = sorted(
        (r for a, r in done.items() if a in wanted), key=lambda r: r["accession"]
    )
    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
