# SEO Verification Script

Technical SEO/GEO verification for `https://www.maasiso.nl`.

## What it checks

- Sitemap parsing quality (`/sitemap.xml`): canonical host, duplicates, malformed paths, `/home` leaks.
- Canonical tag validation on all sitemap URLs.
- Blog metadata parity on `/kennis/blog/:slug`:
  - `canonical`
  - `og:url`
  - JSON-LD `BlogPosting.mainEntityOfPage`
  - JSON-LD `BreadcrumbList` leaf URL
- Robots policy on `/robots.txt`:
  - Required allow/disallow directives
  - Canonical sitemap line
  - Required user-agent sections (including AI crawlers)
- Search index hygiene (`/search?q=iso`): requires `noindex,follow` and canonical `/search`.
- Legacy redirect mapping (`/diensten/*` to current canonical URLs).
- Host consolidation (http/apex/www variants).
- Soft-404 expectations.
- Removed URL checks expecting direct `410 Gone`.

## Usage

```bash
node scripts/seo-verify.js
node scripts/seo-verify.js --json
node scripts/seo-verify.js --output seo-report.json
node scripts/seo-verify.js --fail-fast
node scripts/seo-verify.js --max-retries 3
```

## CLI options

| Option | Description | Default |
| --- | --- | --- |
| `--json` | Print JSON report | `false` |
| `--output <file>` | Write JSON report to file | - |
| `--fail-fast` | Stop on first failure | `false` |
| `--max-retries <n>` | Retry count for failed requests | `2` |

## Exit codes

- `0`: all checks passed
- `1`: one or more checks failed

## Notes

- Canonical host is `https://www.maasiso.nl`.
- Intentional trailing slash exception is allowed only for `/iso-certificering/iso-9001/`.
- Script is CI-friendly via JSON output and non-zero failure exit code.
