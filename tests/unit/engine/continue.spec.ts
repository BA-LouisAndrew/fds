import nock from "nock"

import { initStore } from "@/engine/data/initStore"
import { Agent } from "@/engine/request/agent"
import { createContext } from "@/engine/request/context"
import { ValidationEngine } from "@/engine/validationEngine"
import { ruleset } from "@/seed/rule"
import { Validation } from "@/types/validation"

describe("Validation engine: continue a suspended validation", () => {
  beforeAll(async () => {
    Agent.setClient(createContext())
    await initStore("in-memory").init()
  })

  const validation: Validation<any> = {
    validationId: "97425f58-f48c-4c4b-b602-b287b79679ac",
    totalChecks: 2,
    runnedChecks: 1,
    skippedChecks: [],
    additionalInfo: {
      startDate: "",
      endDate: "",
      customerInformation: {},
    },
    events: [
      {
        name: "sample-rule-2",
        status: "FAILED",
        dateEnded: "",
        dateStarted: "",
        messages: [],
      },
      {
        name: "sample-rule",
        status: "RUNNING",
        dateStarted: "2022-07-07T14:15:37.029Z",
        dateEnded: null,
        messages: [],
      },
    ],
    fraudScore: 0.5,
    passedChecks: [],
    failedChecks: [],
  }

  it("continues a suspended validation process", async () => {
    nock("http://localhost:5001").get("/validate").reply(200)

    const result = await new ValidationEngine().setRuleset(ruleset).setValidation(validation).validateRuleset({})
    expect(result.fraudScore).toEqual(0.25)
  })
})
