# Changelog

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
