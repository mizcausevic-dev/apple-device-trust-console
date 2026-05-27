# Security Policy

`apple-device-trust-console` includes an offline analyzer, CLI, and public synthetic operator dashboard for Apple device-trust posture. It does **not** store MDM credentials, perform live tenant fetches, or expose authenticated write paths.

## Supported Versions

Only the latest `main` branch and the newest tagged release are supported for security fixes.

## Reporting a Vulnerability

- Open a GitHub security advisory:
  - [https://github.com/mizcausevic-dev/apple-device-trust-console/security/advisories/new](https://github.com/mizcausevic-dev/apple-device-trust-console/security/advisories/new)
- Or open a private issue with:
  - affected route or CLI path
  - sample synthetic payload
  - expected vs actual behavior
  - reproduction steps

## Scope notes

- Sample data is synthetic only.
- This repo is an operator-surface proof and offline analysis tool.
- Any production deployment handling real tenant exports should add tenant-isolation review, credential handling review, and org-specific access controls before use.
