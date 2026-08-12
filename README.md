# VialectBench project website

Publication website for **VialectBench: How Robust Are LLMs to Vietnamese Dialects?**

The site is intentionally framework-free and deploys directly with GitHub Pages.

## Preview locally

From this directory, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. A local web server is required because the interactive explorer loads the JSONL benchmark file with `fetch()`.

## Deploy

In the repository settings, set **Pages → Build and deployment → Deploy from a branch**, then select `main` and `/ (root)`. The `.nojekyll` file ensures the static assets are served as-is.

## Content provenance

- Paper facts, authors, affiliations, figures, and reported results are taken from arXiv v1 (`2608.10414`).
- The explorer uses the finalized `probe_dialects.jsonl` benchmark file from the research repository.
- The leaderboard reproduces the paper's cross-task macro-averages; accuracy is used for ER/NLI/MCQA and token-level F1 for QA, so cross-task means are descriptive rather than a single unified metric.
