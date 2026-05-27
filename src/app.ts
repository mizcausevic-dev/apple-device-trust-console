// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  fleetRisks,
  payload,
  remediationPosture,
  summary,
  trustLane,
  verification
} from "./services/appleDeviceTrustConsoleService.js";
import {
  renderDocs,
  renderFleetRisks,
  renderOverview,
  renderRemediationPosture,
  renderTrustLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5512);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/trust-lane", (_req, res) => res.type("html").send(renderTrustLane()));
app.get("/fleet-risks", (_req, res) => res.type("html").send(renderFleetRisks()));
app.get("/remediation-posture", (_req, res) => res.type("html").send(renderRemediationPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/trust-lane", (_req, res) => res.json(trustLane()));
app.get("/api/fleet-risks", (_req, res) => res.json(fleetRisks()));
app.get("/api/remediation-posture", (_req, res) => res.json(remediationPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`Apple Device Trust Console listening on http://${host}:${port}`);
  });
}

export default app;
