# VialectBench project website

Publication website for **VialectBench: How Robust Are LLMs to Vietnamese Dialects?**

The site is intentionally framework-free and deploys directly with GitHub Pages.

## Preview locally

From this directory, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. A local web server is required because the interactive explorer loads the public example JSONL file with `fetch()`.

## Deploy

In the repository settings, set **Pages → Build and deployment → Deploy from a branch**, then select `main` and `/ (root)`. The `.nojekyll` file ensures the static assets are served as-is.

## Content provenance

- Paper facts, authors, affiliations, figures, and reported results are taken from arXiv v1 (`2608.10414`).
- The public explorer and download use only `data/vialectbench-example-32.jsonl`: a balanced preview of 32 source groups, with eight examples from each task. The complete benchmark is intentionally not shipped in the GitHub Pages repository.
- The leaderboard reproduces the paper's cross-task macro-averages; accuracy is used for ER/NLI/MCQA and token-level F1 for QA, so cross-task means are descriptive rather than a single unified metric.

## Rebuild the public example file

From this directory, run:

```powershell
.\scripts\build_example_dataset.ps1
```

The script reads the finalized research dataset outside this website repository and writes only the 32-example public preview.
