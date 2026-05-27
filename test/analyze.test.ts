import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze, isOsVersionBelow, normalizeInput } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { DeviceInput, ManagedDevice } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): DeviceInput =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as DeviceInput;

const NOW = "2026-05-27T08:00:00Z";

describe("analyze", () => {
  it("counts devices and groups by compliance / owner / OS", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    expect(r.devices).toBe(5);
    expect(r.byCompliance.compliant).toBe(3);
    expect(r.byCompliance.noncompliant).toBe(1);
    expect(r.byCompliance.inGracePeriod).toBe(1);
    expect(r.byOwner.company).toBe(4);
    expect(r.byOwner.personal).toBe(1);
    expect(r.byOS.macOS).toBe(2);
    expect(r.byOS.iOS).toBe(1);
    expect(r.byOS.iPadOS).toBe(2);
  });

  it("flags noncompliant devices as high", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const nc = r.findings.filter((f) => f.code === "noncompliant-device");
    expect(nc).toHaveLength(1);
    expect(nc[0].severity).toBe("high");
    expect(nc[0].user).toBe("bob@example.com");
  });

  it("flags device-integrity exceptions as high", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const jb = r.findings.filter((f) => f.code === "device-integrity-exception");
    expect(jb).toHaveLength(1);
    expect(jb[0].deviceName).toBe("field-ipad-byod");
    expect(jb[0].severity).toBe("high");
  });

  it("flags missing-encryption as high", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const me = r.findings.filter((f) => f.code === "missing-encryption");
    expect(me).toHaveLength(1);
    expect(me[0].deviceName).toBe("finance-macbook");
    expect(me[0].severity).toBe("high");
  });

  it("flags outdated-os-version on iOS 16 against default min iOS 17", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const oos = r.findings.filter((f) => f.code === "outdated-os-version");
    expect(oos.some((f) => f.deviceName === "seller-iphone")).toBe(true);
  });

  it("flags stale-checkin medium between N and 2N days, high beyond 2N", () => {
    const r = analyze(fixture("devices.json"), { now: NOW, staleAfterDays: 14 });
    const stale = r.findings.filter((f) => f.code === "stale-checkin");
    // finance-macbook last sync 2026-04-10 → ~47 days, > 2×14 → high
    const daveStale = stale.find((f) => f.deviceName === "finance-macbook");
    expect(daveStale?.severity).toBe("high");
  });

  it("flags orphaned-device when no user is attached", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const orph = r.findings.filter((f) => f.code === "orphaned-device");
    expect(orph).toHaveLength(1);
    expect(orph[0].deviceName).toBe("shared-ipad-frontdesk");
    expect(orph[0].severity).toBe("medium");
  });

  it("flags in-grace-period as medium", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const ig = r.findings.filter((f) => f.code === "in-grace-period");
    expect(ig).toHaveLength(1);
    expect(ig[0].severity).toBe("medium");
  });

  it("flags personal-device-with-corporate-policy as info", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    const pd = r.findings.filter((f) => f.code === "personal-device-with-corporate-policy");
    expect(pd).toHaveLength(1);
    expect(pd[0].severity).toBe("info");
    expect(pd[0].deviceName).toBe("field-ipad-byod");
  });

  it("ok=true on a clean fixture", () => {
    const r = analyze(fixture("devices-clean.json"), { now: NOW });
    expect(r.ok).toBe(true);
    expect(r.findings.filter((f) => f.severity === "high")).toEqual([]);
  });

  it("allows overriding minOsVersions", () => {
    const r = analyze(fixture("devices.json"), {
      now: NOW,
      minOsVersions: { iOS: "10.0" }
    });
    // seller-iphone iOS 16.7 should now pass
    expect(r.findings.find((f) => f.code === "outdated-os-version" && f.deviceName === "seller-iphone")).toBeUndefined();
  });

  it("handles 'error' complianceState as high noncompliant", () => {
    const single: ManagedDevice = {
      id: "x",
      userPrincipalName: "x@example.com",
      operatingSystem: "macOS",
      osVersion: "15.0",
      complianceState: "error",
      isEncrypted: true,
      jailBroken: "False"
    };
    const r = analyze([single], { now: NOW });
    expect(r.findings.find((f) => f.code === "noncompliant-device")?.severity).toBe("high");
  });

  it("falls back to managedDeviceOwnerType when ownerType is missing", () => {
    const r = analyze(
      [{ id: "x", complianceState: "compliant", isEncrypted: true, jailBroken: "False", managedDeviceOwnerType: "personal", userPrincipalName: "p@e.com", operatingSystem: "iOS", osVersion: "18.0", lastSyncDateTime: NOW }],
      { now: NOW }
    );
    expect(r.byOwner.personal).toBe(1);
  });
});

describe("isOsVersionBelow", () => {
  it("returns false when no version is present", () => {
    expect(isOsVersionBelow(undefined, "10.0")).toBe(false);
  });
  it("compares major.minor numerically", () => {
    expect(isOsVersionBelow("9.5", "10.0")).toBe(true);
    expect(isOsVersionBelow("10.0", "10.0")).toBe(false);
    expect(isOsVersionBelow("10.1", "10.0")).toBe(false);
    expect(isOsVersionBelow("11.0", "10.5")).toBe(false);
    expect(isOsVersionBelow("10.0.22631", "10.0")).toBe(false);
  });
});

describe("normalizeInput", () => {
  it("accepts single, array, and envelope", () => {
    const single: ManagedDevice = { id: "x" };
    expect(normalizeInput(single)).toEqual([single]);
    expect(normalizeInput([single])).toEqual([single]);
    expect(normalizeInput({ value: [single] })).toEqual([single]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first and renders ❌", () => {
    const md = toMarkdown(analyze(fixture("devices.json"), { now: NOW }));
    expect(md).toContain("❌");
    const highIdx = md.indexOf("🔴");
    const infoIdx = md.indexOf("ℹ️");
    expect(highIdx).toBeLessThan(infoIdx);
  });

  it("toMarkdown renders ✅ + 'No findings.' on a clean fleet", () => {
    const md = toMarkdown(analyze(fixture("devices-clean.json"), { now: NOW }));
    expect(md).toContain("✅");
    expect(md).toContain("No findings.");
  });

  it("toSummary emits a one-liner", () => {
    const r = analyze(fixture("devices.json"), { now: NOW });
    expect(toSummary(r)).toMatch(/^5 devices/);
  });
});
