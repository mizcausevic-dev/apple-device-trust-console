// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze, normalizeInput } from "../analyze.js";
import { fleetLanePackets, remediationPackets, sampleFleetPayload } from "../data/sampleFleet.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-29T00:00:00Z";
const report = analyze(sampleFleetPayload, {
  now: NOW,
  staleAfterDays: 14
});
const devices = normalizeInput(sampleFleetPayload);

function severityRank(finding: Finding): number {
  return finding.severity === "high"
    ? 0
    : finding.severity === "medium"
      ? 1
      : finding.severity === "low"
        ? 2
        : 3;
}

export function summary() {
  return {
    devices: report.devices,
    healthyDevices: report.byCompliance.compliant,
    noncompliantDevices: report.byCompliance.noncompliant + report.byCompliance.error,
    staleDevices: report.findings.filter((finding) => finding.code === "stale-checkin").length,
    personalDevices: report.byOwner.personal,
    highFindings: report.findings.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Clear encryption, stale check-in, and noncompliant Apple posture first so endpoint access does not drift ahead of governance."
  };
}

export function trustLane() {
  return devices.map((device) => {
    const packet = fleetLanePackets.find((item) => item.deviceId === device.id);
    const relatedFindings = report.findings.filter((finding) => finding.deviceId === device.id);
    const severity =
      relatedFindings.find((finding) => finding.severity === "high") !== undefined
        ? "red"
        : relatedFindings.find((finding) => finding.severity === "medium") !== undefined
          ? "yellow"
          : "green";

    return {
      deviceId: device.id,
      deviceName: device.deviceName ?? device.id,
      owner: packet?.owner ?? "Endpoint Operations",
      lane: packet?.lane ?? "Trust lane",
      businessRole: packet?.businessRole ?? "Managed Apple device",
      operatingSystem: device.operatingSystem ?? "Unknown",
      complianceState: device.complianceState ?? "unknown",
      severity,
      findingCount: relatedFindings.length,
      nextAction: packet?.nextAction ?? "Review device findings and attach remediation proof.",
      note: packet?.note ?? "Synthetic sample device lane."
    };
  });
}

export function fleetRisks() {
  return [...report.findings]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => {
      const owner =
        fleetLanePackets.find((item) => item.deviceId === finding.deviceId)?.owner ??
        "Endpoint Operations";
      const device = devices.find((item) => item.id === finding.deviceId);
      return {
        ...finding,
        owner,
        operatingSystem: device?.operatingSystem ?? "Unknown",
        complianceState: device?.complianceState ?? "unknown"
      };
    });
}

export function remediationPosture() {
  return remediationPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static text alone.",
    "Apple device posture is rendered with synthetic sample data only; no live tenant export is published.",
    "Trust-lane, fleet-risk, and remediation packet views stay buyer-readable for Apple endpoint, security, and IT stakeholders.",
    "This surface demonstrates endpoint governance and Apple device-trust operations, not a generic cloud lab.",
    "It composes cleanly with Entra and Defender proof for a stronger recruiter-facing device-governance lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    trustLane: trustLane(),
    fleetRisks: fleetRisks(),
    remediationPosture: remediationPosture(),
    verification: verification(),
    sample: sampleFleetPayload
  };
}
