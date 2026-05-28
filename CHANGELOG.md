# Changelog

## v1.0.0-prod — 2026-05-28
- Production hardening pass on Codex's v0.1-shipped scaffold. Confirmed CI + Pages workflow green on `main` at HEAD before tagging `v1.0-prod`.
- Codex's v2-era scaffold already carries the `## Production status` block, `## Part of the Kinetic Gain Suite` SEO footer, `Monetization ladder` with honest tier wording, and KGE `/embedded` tie-back — confirmed unchanged, no narrative edits.
- Added `apple.kineticgain.com` to `procurement-pulse-engine/universe.csv` per the v2 "every deploy enters universe" rule.
- No `src/`, README narrative, docs, or screenshot edits — squad doctrine v1.1 respects the v0.1-shipped operator-surface as Codex shipped it.

## v0.1.0 - 2026-05-27

- Initial release: operator control plane for Apple device trust across macOS, iOS, and iPadOS fleets.
- Reads normalized MDM device-export JSON (single device, array, or `{ "value": [ ... ] }` envelope).
- 8 finding codes covering noncompliance, device-integrity exception, missing encryption, OS-version drift, stale check-ins, orphaned devices, grace-period flips, and personal-device-with-corporate-policy review.
- Public routes:
  - `/`
  - `/trust-lane`
  - `/fleet-risks`
  - `/remediation-posture`
  - `/verification`
  - `/docs`
- API routes:
  - `/api/dashboard/summary`
  - `/api/trust-lane`
  - `/api/fleet-risks`
  - `/api/remediation-posture`
  - `/api/verification`
  - `/api/sample`
- CLI: `apple-device-trust <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--stale-after-days N`, `--fail-on-high`, `--out FILE`.
- Static operator surface deployed to https://apple.kineticgain.com/ via GitHub Pages with `robots.txt`, `sitemap.xml`, README screenshots, and `docs/KINETIC_GAIN_EMBEDDED.md`.
