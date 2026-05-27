# Architecture

`apple-device-trust-console` has two layers:

1. Offline analyzer + CLI
   - reads normalized device-export JSON
   - computes noncompliance, integrity-exception, encryption-gap, stale-check-in, OS-drift, orphaned-device, and personal-device review findings
   - emits JSON, markdown, or summary output for operator-safe reuse

2. Static operator surface
   - prerenders synthetic dashboard routes for trust-lane, fleet-risk, remediation, verification, and docs views
   - exposes machine-readable API payloads alongside human-readable HTML routes
   - publishes crawlable `robots.txt`, `sitemap.xml`, and README proof assets

The analyzer is intentionally offline-safe. The public surface demonstrates the operator pattern without exposing tenant credentials or live device data.
