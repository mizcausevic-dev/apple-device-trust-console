import { fleetRisks, summary, trustLane } from "../src/services/appleDeviceTrustConsoleService.js";

console.log("apple-device-trust-console demo");
console.log(JSON.stringify(summary(), null, 2));
console.log(
  JSON.stringify(
    trustLane().map((lane) => ({
      deviceName: lane.deviceName,
      owner: lane.owner,
      complianceState: lane.complianceState
    })),
    null,
    2
  )
);
console.log(JSON.stringify(fleetRisks().slice(0, 3), null, 2));
