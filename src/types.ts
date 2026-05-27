// Operator surface for Apple device trust.
// Input: normalized device-export JSON from an MDM or endpoint-management source.

export type ComplianceState =
  | "unknown"
  | "compliant"
  | "noncompliant"
  | "conflict"
  | "error"
  | "inGracePeriod"
  | "configManager";

export type ManagementAgent =
  | "eas"
  | "mdm"
  | "easMdm"
  | "appleMdm"
  | "configurationManagerClient"
  | "configurationManagerClientMdm"
  | "configurationManagerClientMdmEas"
  | "unknown"
  | "googleCloudDevicePolicyController";

export type DeviceOwnerType = "company" | "personal" | "unknown";
export type OperatingSystem =
  | "iOS"
  | "iPadOS"
  | "macOS"
  | "tvOS"
  | "visionOS"
  | string;

export interface ManagedDevice {
  id: string;
  deviceName?: string;
  userPrincipalName?: string;
  userId?: string;
  managementAgent?: ManagementAgent;
  operatingSystem?: OperatingSystem;
  osVersion?: string;
  complianceState?: ComplianceState;
  jailBroken?: "Unknown" | "True" | "False";
  isEncrypted?: boolean;
  isSupervised?: boolean;
  enrolledDateTime?: string;
  lastSyncDateTime?: string;
  managedDeviceOwnerType?: DeviceOwnerType;
  ownerType?: DeviceOwnerType;
  serialNumber?: string;
}

export type DeviceInput =
  | ManagedDevice
  | ManagedDevice[]
  | { value: ManagedDevice[] };

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "noncompliant-device"
  | "device-integrity-exception"
  | "missing-encryption"
  | "stale-checkin"
  | "outdated-os-version"
  | "orphaned-device"
  | "personal-device-with-corporate-policy"
  | "in-grace-period";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  deviceId: string;
  deviceName?: string;
  user?: string;
}

export interface ComplianceReport {
  generatedAt: string;
  devices: number;
  byCompliance: Record<ComplianceState, number>;
  byOS: Record<string, number>;
  byOwner: Record<DeviceOwnerType, number>;
  findings: Finding[];
  ok: boolean;
}

export interface ComplianceOptions {
  now?: string;
  staleAfterDays?: number;
  minOsVersions?: Partial<Record<"iOS" | "iPadOS" | "macOS" | "tvOS" | "visionOS", string>>;
}

export const DEFAULT_MIN_OS_VERSIONS: Required<NonNullable<ComplianceOptions["minOsVersions"]>> = {
  iOS: "17.0",
  iPadOS: "17.0",
  macOS: "14.0",
  tvOS: "17.0",
  visionOS: "2.0"
};
