import {
  DEFAULT_MIN_OS_VERSIONS,
  type ComplianceOptions,
  type ComplianceReport,
  type ComplianceState,
  type DeviceInput,
  type DeviceOwnerType,
  type Finding,
  type ManagedDevice
} from "./types.js";

const DAY_MS = 86_400_000;

const COMPLIANCE_STATES: ComplianceState[] = [
  "unknown",
  "compliant",
  "noncompliant",
  "conflict",
  "error",
  "inGracePeriod",
  "configManager"
];

const OWNER_TYPES: DeviceOwnerType[] = ["company", "personal", "unknown"];

function emptyCompliance(): Record<ComplianceState, number> {
  const out = {} as Record<ComplianceState, number>;
  for (const state of COMPLIANCE_STATES) {
    out[state] = 0;
  }
  return out;
}

function emptyOwner(): Record<DeviceOwnerType, number> {
  const out = {} as Record<DeviceOwnerType, number>;
  for (const owner of OWNER_TYPES) {
    out[owner] = 0;
  }
  return out;
}

export function normalizeInput(input: DeviceInput): ManagedDevice[] {
  if (Array.isArray(input)) {
    return input;
  }
  if ("value" in input && Array.isArray((input as { value: ManagedDevice[] }).value)) {
    return (input as { value: ManagedDevice[] }).value;
  }
  return [input as ManagedDevice];
}

export function isOsVersionBelow(deviceVersion: string | undefined, minimum: string): boolean {
  if (!deviceVersion) {
    return false;
  }
  const dv = deviceVersion.split(/[.\s]/).map((value) => parseInt(value, 10));
  const mv = minimum.split(/[.\s]/).map((value) => parseInt(value, 10));
  for (let i = 0; i < mv.length; i++) {
    const d = dv[i] ?? 0;
    const m = mv[i] ?? 0;
    if (d < m) {
      return true;
    }
    if (d > m) {
      return false;
    }
  }
  return false;
}

export function analyze(input: DeviceInput, opts: ComplianceOptions = {}): ComplianceReport {
  const now = opts.now ? new Date(opts.now) : new Date();
  const staleAfter = (opts.staleAfterDays ?? 14) * DAY_MS;
  const minOs = { ...DEFAULT_MIN_OS_VERSIONS, ...(opts.minOsVersions ?? {}) };

  const devices = normalizeInput(input);
  const findings: Finding[] = [];
  const byCompliance = emptyCompliance();
  const byOwner = emptyOwner();
  const byOS: Record<string, number> = {};

  for (const device of devices) {
    const state = (device.complianceState ?? "unknown") as ComplianceState;
    byCompliance[state] = (byCompliance[state] ?? 0) + 1;

    const owner = (device.ownerType ?? device.managedDeviceOwnerType ?? "unknown") as DeviceOwnerType;
    byOwner[owner] = (byOwner[owner] ?? 0) + 1;

    const os = device.operatingSystem ?? "unknown";
    byOS[os] = (byOS[os] ?? 0) + 1;

    const ctx = {
      deviceId: device.id,
      deviceName: device.deviceName ?? "",
      user: device.userPrincipalName ?? device.userId
    };
    const finding = (code: Finding["code"], severity: Finding["severity"], message: string): Finding => {
      const out: Finding = { code, severity, message, deviceId: ctx.deviceId };
      if (ctx.deviceName) {
        out.deviceName = ctx.deviceName;
      }
      if (ctx.user) {
        out.user = ctx.user;
      }
      return out;
    };

    if (state === "noncompliant" || state === "error") {
      findings.push(finding("noncompliant-device", "high", `Device is ${state}.`));
    } else if (state === "inGracePeriod") {
      findings.push(
        finding(
          "in-grace-period",
          "medium",
          "Device is in trust grace period and will flip noncompliant if not remediated."
        )
      );
    }

    if (device.jailBroken === "True") {
      findings.push(
        finding(
          "device-integrity-exception",
          "high",
          "Device integrity exception detected; investigate jailbreak, root, or trust-compromise signals."
        )
      );
    }

    if (device.isEncrypted === false) {
      findings.push(finding("missing-encryption", "high", "Disk encryption is not enabled."));
    }

    if (device.lastSyncDateTime) {
      const age = now.getTime() - new Date(device.lastSyncDateTime).getTime();
      if (age > staleAfter) {
        findings.push(
          finding(
            "stale-checkin",
            age > staleAfter * 2 ? "high" : "medium",
            `Last device check-in ${Math.round(age / DAY_MS)} day(s) ago.`
          )
        );
      }
    }

    const platformKey = device.operatingSystem as keyof typeof minOs | undefined;
    if (platformKey && platformKey in minOs && isOsVersionBelow(device.osVersion, minOs[platformKey])) {
      findings.push(
        finding(
          "outdated-os-version",
          "medium",
          `${device.operatingSystem} ${device.osVersion} is below the minimum ${minOs[platformKey]}.`
        )
      );
    }

    if (!device.userPrincipalName && !device.userId) {
      findings.push(finding("orphaned-device", "medium", "Managed device has no associated user."));
    }

    if (
      owner === "personal" &&
      (state === "compliant" || state === "noncompliant" || state === "inGracePeriod")
    ) {
      findings.push(
        finding(
          "personal-device-with-corporate-policy",
          "info",
          "Personal Apple device is under corporate trust policy; confirm policy boundary and approved scope."
        )
      );
    }
  }

  return {
    generatedAt: now.toISOString(),
    devices: devices.length,
    byCompliance,
    byOS,
    byOwner,
    findings,
    ok: !findings.some((finding) => finding.severity === "high")
  };
}
