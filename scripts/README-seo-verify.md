# SEO Migration Verification Script

Automated verification tool for SEO migration fixes on `https://maasiso.nl`. Detects regressions in host consolidation, redirects, canonical tags, and sitemap formatting.

## What it checks

### Must-have validations
- ✅ **Sitemap parsing** - Validates all URLs in sitemap.xml (non-www, https, no whitespace, no double slashes, no `/home`)
- ✅ **Canonical verification** - Checks server-rendered `<link rel="canonical">` tags on all sitemap URLs
- ✅ **Legacy redirects** - Tests all old `/diensten/*` routes redirect correctly (301/308)
- ✅ **Host consolidation** - Verifies www/http variants redirect to canonical https://maasiso.nl
- ✅ **Trailing slash normalization** - Ensures canonical URLs don't have trailing slashes (except homepage)
- ✅ **Soft-404 cleanup** - Tests `/index.html`, `/algemene-voorwaarden`, `/$` for correct status codes

### Features
- ⚡ **Concurrent requests** (default: 6 parallel)
- 🔄 **Automatic retries** with exponential backoff (default: 2 retries)
- ⏱️ **Timeouts** (20s per request)
- 📊 **JSON output** for CI integration
- 🚀 **Fail-fast mode** for quick feedback
- 🔍 **Redirect chain tracking** for debugging
- 📝 **Detailed error messages** with URL + reason

## Usage

### Basic usage
```bash
node scripts/seo-verify.js
```

### With options
```bash
# JSON output to console
node scripts/seo-verify.js --json

# Save JSON report to file
node scripts/seo-verify.js --output seo-report.json

# Fail fast on first error (useful for development)
node scripts/seo-verify.js --fail-fast

# Custom retry limit
node scripts/seo-verify.js --max-retries 3

# Combined options
node scripts/seo-verify.js --json --output report.json --max-retries 1
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--json` | Output results as JSON (no console colors) | false |
| `--output <file>` | Save JSON report to file | - |
| `--fail-fast` | Stop on first failure (faster feedback) | false |
| `--max-retries <n>` | Maximum retries for failed requests | 2 |

## Exit Codes

- `0` - All checks passed ✅
- `1` - One or more checks failed ❌

## Output Examples

### Console output (default)
```
=== Sitemap ===
Total URLs: 54
✅ Sitemap entries are valid

=== Canonical Verification ===
✅ https://maasiso.nl
✅ https://maasiso.nl/over-ons
❌ https://maasiso.nl/iso-45001
   - Canonical points to homepage for non-home page

Final Result: ❌ FAILED (1 issue(s) in 4.40s)
```

### JSON output (--json)
```json
{
  "timestamp": "2026-01-25T20:00:00.000Z",
  "site": "https://maasiso.nl",
  "summary": {
    "totalIssues": 1,
    "passed": false,
    "duration": "4.40s",
    "checks": {
      "sitemap": { "total": 54, "invalid": 0 },
      "canonical": { "total": 54, "failed": 1 },
      "legacyRedirects": { "total": 7, "failed": 0 },
      "hostConsolidation": { "total": 3, "failed": 0 },
      "soft404": { "total": 3, "failed": 0 }
    }
  }
}
```

## CI Integration

### GitHub Actions

Add this workflow to `.github/workflows/seo-verify.yml`:

```yaml
name: SEO Verification

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  pull_request:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  verify-seo:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run SEO verification
        run: node scripts/seo-verify.js --output seo-report.json

      - name: Upload report artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: seo-report
          path: seo-report.json
          retention-days: 30

      - name: Comment PR with results
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('seo-report.json', 'utf8'));

            let comment = '## SEO Verification Failed ❌\n\n';
            comment += `**Total issues:** ${report.summary.totalIssues}\n\n`;
            comment += '### Failed Checks\n';

            for (const [key, value] of Object.entries(report.summary.checks)) {
              if (value.failed > 0) {
                comment += `- **${key}**: ${value.failed}/${value.total} failed\n`;
              }
            }

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Vercel Deploy Hooks

Add to your build command in `package.json`:

```json
{
  "scripts": {
    "verify:seo": "node scripts/seo-verify.js --fail-fast",
    "build": "next build && npm run verify:seo"
  }
}
```

## Troubleshooting

### Script times out
- Increase `REQUEST_TIMEOUT` in the script (default: 20s)
- Reduce `CONCURRENCY` to avoid rate limiting (default: 6)
- Check if the site is responding slowly

### False positives
- Check if Vercel deployment is complete before running
- Verify DNS is propagated if testing after domain changes
- Use `--max-retries 3` for flaky networks

### Debugging
```bash
# Enable debug mode with stack traces
DEBUG=1 node scripts/seo-verify.js

# Test single check (edit script to comment out other checks)
# Or use fail-fast for quick iteration
node scripts/seo-verify.js --fail-fast
```

## Development

To add new checks, follow this pattern:

```javascript
async function checkMyNewFeature() {
  const results = [];
  for (const item of items) {
    try {
      const { response, finalUrl, chain, retries } = await fetchWithRedirects(url);
      const issues = [];

      // Your validation logic
      if (somethingWrong) {
        issues.push('Description of issue');
      }

      if (options.failFast && issues.length > 0) {
        throw new FailFastError(`Fail-fast triggered: ${url}`);
      }

      results.push({ url, issues, chain, retries });
    } catch (error) {
      if (error instanceof FailFastError) throw error;
      results.push({ url, issues: [`Error: ${error.message}`] });
    }
  }
  return results;
}
```

## License

MIT - MaasISO

