import { Validation } from "@/types/validation"

import { sampleCustomer } from "./customer"
import { sampleRule } from "./rule"

export const sampleValidation: Validation = {
  validationId: "52907745-7672-470e-a803-a2f8feb52944",
  fraudScore: 0.3,
  totalChecks: 6,
  runnedChecks: 2,
  currentlyRunning: {
    number: 3,
    name: sampleRule.name,
  },
  passedChecks: [
    {
      name: "passed-check-1",
      dateEnded: null,
      dateStarted: null
    },
  ],
  failedChecks: [
    {
      dateEnded: null,
      dateStarted: null,
      name: "failed-check-1",
      messages: ["IP is blacklisted"],
    },
  ],
  skippedChecks: ["skipped-check-1", "skipped-check-2"],
  additionalInfo: {
    startDate: new Date("09-10-2000").toISOString(),
    customerInformation: sampleCustomer,
  },
  events: []
}
