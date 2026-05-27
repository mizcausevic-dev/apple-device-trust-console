// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  renderDocs,
  renderFleetRisks,
  renderOverview,
  renderRemediationPosture,
  renderTrustLane,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview contains control-plane framing", () => {
    expect(renderOverview()).toContain("Apple device trust, stale check-in drift");
  });

  test("detail pages expose their lane names", () => {
    expect(renderTrustLane()).toContain("Trust Lane");
    expect(renderFleetRisks()).toContain("Fleet Risks");
    expect(renderRemediationPosture()).toContain("Remediation Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline device-export analysis");
  });
});
