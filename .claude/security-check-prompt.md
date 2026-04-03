# Security Audit — Automated Weekly Check

You are running a security audit on this repository inside GitHub Actions.
Your goal: identify real security issues and write a structured JSON report.
Be thorough but precise — no false positives, but don't miss anything critical.

## 1. Dependency Audit

- Run `pnpm audit --json` and parse the output
- Classify findings by severity (critical, high, medium, low)
- Check for outdated packages with known vulnerabilities
- Verify `pnpm-lock.yaml` is consistent with `package.json`

## 2. Hardcoded Secrets & Credentials

- Scan all source files for patterns: API keys, tokens, passwords, private keys, connection strings
- Check if `.env` files are committed to the repo (should be in `.gitignore`)
- Look for base64-encoded secrets or suspicious long strings in config files
- Check for secrets in test fixtures or example configs

## 3. Code Security Patterns

- **Injection:** SQL injection (raw string interpolation in queries), command injection (unsanitized shell commands), NoSQL injection
- **XSS:** Unescaped user input in templates, `v-html` without sanitization, `innerHTML` usage
- **SSRF:** User-controlled URLs in fetch/request calls without validation
- **Path Traversal:** Unsanitized file path construction from user input
- **Insecure Crypto:** Weak algorithms (MD5, SHA1 for security), hardcoded IVs/salts
- **eval() / Function():** Dynamic code execution from user-controlled input
- **Prototype Pollution:** Unsafe object merging (e.g., `Object.assign` with user input)

## 4. Configuration & Infrastructure

- Check for overly permissive CORS settings (wildcard origins)
- Verify authentication middleware is applied to all protected routes
- Check for debug/development settings that should not be in production
- Review CSP headers, HSTS, X-Frame-Options if applicable
- Check rate-limiting on authentication endpoints
- Review input validation on API endpoints

## 5. TypeScript-Specific

- Look for excessive `any` types that bypass type safety in security-critical code
- Check for unsafe type assertions (`as any`, `as unknown as X`) in auth/validation logic
- Verify `strict` mode is enabled in `tsconfig.json`

## 6. Output

Write a file named `security-report.json` in the repository root with this exact JSON schema:

```json
{
  "repo": "repository-name",
  "scan_date": "2024-01-01T00:00:00Z",
  "summary": "Human-readable 1-3 sentence summary of findings",
  "risk_level": "clean|low|medium|high|critical",
  "issues": [
    {
      "id": "SEC-001",
      "category": "dependency|secret|code|config|typescript",
      "severity": "critical|high|medium|low|info",
      "title": "Short descriptive title",
      "description": "Detailed description of the issue and its impact",
      "file": "path/to/file.ts",
      "line": 42,
      "recommendation": "Specific steps to fix this issue",
      "references": ["https://cve.mitre.org/..."]
    }
  ],
  "dependency_audit": {
    "ran": true,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "files_scanned": 0
}
```

## Rules

- Only report real, verifiable issues. Do not speculate or invent problems.
- If no issues are found, return an empty `issues` array and set `risk_level` to `"clean"`.
- The JSON must be valid and parseable. No markdown, no comments in the JSON file.
- Focus on actionable findings. Informational notes should use severity `"info"`.
- Set `risk_level` based on the highest severity found (critical > high > medium > low > clean).
- Number issues sequentially: SEC-001, SEC-002, etc.
