import type { ComplianceReport, FindingSeverity } from "./types.js";

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  high: "🔴 high",
  medium: "🟠 medium",
  low: "🟡 low",
  info: "ℹ️  info"
};

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
};

export function toMarkdown(report: ComplianceReport): string {
  const lines: string[] = [];
  lines.push(report.ok ? "# Apple device trust ✅" : "# Apple device trust ❌");
  lines.push("");
  lines.push(`Generated: \`${report.generatedAt}\``);
  lines.push("");
  lines.push("## Fleet");
  lines.push("");
  lines.push(`- Devices: **${report.devices}**`);
  lines.push(
    `- Compliance: compliant=${report.byCompliance.compliant} · noncompliant=${report.byCompliance.noncompliant} · inGracePeriod=${report.byCompliance.inGracePeriod} · error=${report.byCompliance.error} · unknown=${report.byCompliance.unknown}`
  );
  lines.push(
    `- Owner: company=${report.byOwner.company} · personal=${report.byOwner.personal} · unknown=${report.byOwner.unknown}`
  );

  const ranked = [...report.findings].sort(
    (left, right) => SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity]
  );

  if (ranked.length > 0) {
    lines.push("");
    lines.push(`## Findings (${ranked.length})`);
    lines.push("");
    lines.push("| severity | code | device | user | message |");
    lines.push("|---|---|---|---|---|");
    for (const finding of ranked) {
      lines.push(
        `| ${SEVERITY_LABEL[finding.severity]} | \`${finding.code}\` | ${finding.deviceName ?? finding.deviceId} | ${finding.user ?? "—"} | ${finding.message} |`
      );
    }
  } else {
    lines.push("");
    lines.push("No findings.");
  }

  return lines.join("\n");
}

export function toSummary(report: ComplianceReport): string {
  const counts: Record<FindingSeverity, number> = { high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of report.findings) {
    counts[finding.severity] += 1;
  }
  return `${report.devices} device${report.devices === 1 ? "" : "s"} · ${counts.high} high · ${counts.medium} medium · ${counts.info} info (${report.ok ? "ok" : "fail"})`;
}
