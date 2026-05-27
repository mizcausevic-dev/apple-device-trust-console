// SPDX-License-Identifier: AGPL-3.0-or-later

import type { DeviceInput } from "../types.js";

export interface FleetLanePacket {
  deviceId: string;
  owner: string;
  lane: string;
  businessRole: string;
  nextAction: string;
  note: string;
}

export interface RemediationPacket {
  packetId: string;
  lane: string;
  owner: string;
  completenessScore: number;
  status: "red" | "yellow" | "green";
  blocker: string;
  launchWindowHours: number;
  decisionNote: string;
}

export const sampleFleetPayload: DeviceInput = {
  value: [
    {
      id: "dev-kg-100",
      deviceName: "exec-macbook-pro-01",
      userPrincipalName: "alex.exec@kineticgain.example",
      operatingSystem: "macOS",
      osVersion: "15.4",
      complianceState: "compliant",
      jailBroken: "False",
      isEncrypted: true,
      enrolledDateTime: "2025-11-01T10:00:00Z",
      lastSyncDateTime: "2026-05-28T22:15:00Z",
      ownerType: "company"
    },
    {
      id: "dev-kg-204",
      deviceName: "seller-iphone-02",
      userPrincipalName: "brooke.sales@kineticgain.example",
      operatingSystem: "iOS",
      osVersion: "16.7",
      complianceState: "noncompliant",
      jailBroken: "False",
      isEncrypted: true,
      enrolledDateTime: "2024-04-10T10:00:00Z",
      lastSyncDateTime: "2026-05-22T12:00:00Z",
      ownerType: "company"
    },
    {
      id: "dev-kg-309",
      deviceName: "field-ipad-byod-07",
      userPrincipalName: "casey.ops@kineticgain.example",
      operatingSystem: "iPadOS",
      osVersion: "18.0",
      complianceState: "compliant",
      jailBroken: "True",
      isEncrypted: true,
      enrolledDateTime: "2025-06-01T10:00:00Z",
      lastSyncDateTime: "2026-05-28T18:00:00Z",
      ownerType: "personal"
    },
    {
      id: "dev-kg-411",
      deviceName: "finance-macbook-air-04",
      userPrincipalName: "drew.finance@kineticgain.example",
      operatingSystem: "macOS",
      osVersion: "14.5",
      complianceState: "compliant",
      jailBroken: "False",
      isEncrypted: false,
      enrolledDateTime: "2025-10-01T10:00:00Z",
      lastSyncDateTime: "2026-04-12T12:00:00Z",
      ownerType: "company"
    },
    {
      id: "dev-kg-512",
      deviceName: "shared-ipad-frontdesk",
      operatingSystem: "iPadOS",
      osVersion: "17.2",
      complianceState: "inGracePeriod",
      jailBroken: "False",
      isEncrypted: true,
      enrolledDateTime: "2025-08-01T10:00:00Z",
      lastSyncDateTime: "2026-05-28T01:00:00Z",
      ownerType: "company"
    }
  ]
};

export const fleetLanePackets: FleetLanePacket[] = [
  {
    deviceId: "dev-kg-100",
    owner: "Executive IT",
    lane: "Executive Mac fleet",
    businessRole: "Privileged executive MacBook used for approvals and planning",
    nextAction: "Preserve green posture and archive current trust proof for the next audit packet.",
    note: "Healthy company-owned Mac endpoint used as the baseline control lane."
  },
  {
    deviceId: "dev-kg-204",
    owner: "Sales Operations IT",
    lane: "Seller iPhone fleet",
    businessRole: "Revenue-critical iPhone for a traveling seller",
    nextAction: "Clear noncompliance and raise iOS version before the next launch window.",
    note: "Noncompliant iPhone posture creates immediate access and rollout risk."
  },
  {
    deviceId: "dev-kg-309",
    owner: "Personal Device Governance",
    lane: "Personal iPad review lane",
    businessRole: "Personal iPad under corporate trust policy scope",
    nextAction: "Review integrity exception and confirm approved personal-device boundaries before allowing continued access.",
    note: "Personal-device scope is active, but the device needs immediate trust review."
  },
  {
    deviceId: "dev-kg-411",
    owner: "Finance Platform Support",
    lane: "Finance Mac fleet",
    businessRole: "MacBook handling finance workflows and approvals",
    nextAction: "Restore encryption and re-establish sync hygiene before the next finance close period.",
    note: "Encryption gap and stale check-in make this the highest evidence-risk device in the sample."
  },
  {
    deviceId: "dev-kg-512",
    owner: "Frontline Operations",
    lane: "Shared iPad / frontline lane",
    businessRole: "Shared iPad without named user mapping",
    nextAction: "Attach ownership, resolve grace-period posture, and keep frontline access from drifting into blind spots.",
    note: "Shared iPad is close to flipping noncompliant and has no attached user."
  }
];

export const remediationPackets: RemediationPacket[] = [
  {
    packetId: "TP-14",
    lane: "Seller iPhone fleet",
    owner: "Sales Operations IT",
    completenessScore: 58,
    status: "red",
    blocker: "Noncompliant iPhone below minimum version still attached to active seller workflow",
    launchWindowHours: 12,
    decisionNote: "Do not treat revenue-mobile access as healthy until the noncompliance and OS drift are remediated."
  },
  {
    packetId: "TP-21",
    lane: "Finance Mac fleet",
    owner: "Finance Platform Support",
    completenessScore: 63,
    status: "red",
    blocker: "Encryption disabled and last device check-in is far beyond the stale threshold",
    launchWindowHours: 20,
    decisionNote: "Hold finance-adjacent privileged work until encryption and check-in posture are restored."
  },
  {
    packetId: "TP-29",
    lane: "Personal iPad review lane",
    owner: "Personal Device Governance",
    completenessScore: 70,
    status: "yellow",
    blocker: "Integrity exception remains unresolved on a personal device under corporate policy",
    launchWindowHours: 30,
    decisionNote: "Confirm personal-device policy scope and access controls before allowing continued production access."
  },
  {
    packetId: "TP-38",
    lane: "Shared iPad / frontline lane",
    owner: "Frontline Operations",
    completenessScore: 81,
    status: "yellow",
    blocker: "Grace-period device has no named user and needs ownership proof",
    launchWindowHours: 48,
    decisionNote: "Shared-device access can remain online briefly, but only with ownership and trust remediation queued."
  },
  {
    packetId: "TP-44",
    lane: "Executive Mac fleet",
    owner: "Executive IT",
    completenessScore: 97,
    status: "green",
    blocker: "No active blocker",
    launchWindowHours: 72,
    decisionNote: "Control lane is safe for archive and audit-ready endpoint proof."
  }
];
