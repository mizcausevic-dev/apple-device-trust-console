// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  fleetRisks,
  payload,
  remediationPosture,
  summary,
  trustLane,
  verification
} from "./appleDeviceTrustConsoleService.js";

describe("appleDeviceTrustConsoleService", () => {
  test("summary exposes fleet metrics", () => {
    const out = summary();
    expect(out.devices).toBe(5);
    expect(out.highFindings).toBeGreaterThan(0);
    expect(out.recommendation).toContain("Apple posture");
  });

  test("trust lane returns one packet per device", () => {
    const lane = trustLane();
    expect(lane).toHaveLength(5);
    expect(lane[0]?.deviceName).toBeDefined();
  });

  test("fleet risks are sorted by severity", () => {
    const risks = fleetRisks();
    expect(risks[0]?.severity).toBe("high");
  });

  test("payload contains the public surface fragments", () => {
    const out = payload();
    expect(out.trustLane).toHaveLength(5);
    expect(out.fleetRisks.length).toBeGreaterThan(0);
    expect(remediationPosture()).toHaveLength(5);
    expect(verification()[0]).toContain("offline analyzer");
  });
});
