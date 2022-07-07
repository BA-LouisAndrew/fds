import nock from "nock"

import { initStore } from "@/engine/data/initStore"
import { Agent } from "@/engine/request/agent"
import { createContext } from "@/engine/request/context"
import { ValidationEngine } from "@/engine/validationEngine"
import { ruleA, ruleB, ruleset } from "@/seed/rule"

describe("Validation engine: Validate rule set", () => {
  beforeAll(async () => {
    Agent.setClient(createContext())
    await initStore("in-memory").init()
  })

  it("returns the correct value if the validation for both rules succeed", async () => {
    nock("http://localhost:5001").get("/validate").reply(200)
    nock("http://localhost:5003").post("/validate").reply(201, { message: "Operation successful" })

    const result = await new ValidationEngine().setRuleset(ruleset).validateRuleset({})

    expect(result.fraudScore).toEqual(0)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(2)
    expect(result.failedChecks.length).toEqual(0)
  })

  it("returns the correct value if one of the validation failed", async () => {
    nock("http://localhost:5001").get("/validate").reply(200)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine().setRuleset(ruleset).validateRuleset({})

    expect(result.fraudScore).toEqual(0.25)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(1)
    expect(result.failedChecks.length).toEqual(1)
  })

  it("returns the correct value if both of the validation failed", async () => {
    nock("http://localhost:5001").get("/validate").reply(400)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine().setRuleset(ruleset).validateRuleset({})

    expect(result.fraudScore).toEqual(0.3)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(2)
  })

  it("skips evaluating a rule if the `skip` property is set", async () => {
    nock("http://localhost:5001").get("/validate").reply(201)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine()
      .setRuleset([
        {
          ...ruleA,
          skip: true,
        },
        ruleB,
      ])
      .validateRuleset({})

    expect(result.fraudScore).toEqual(0.5)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(1)
    expect(result.skippedChecks.length).toEqual(1)
  })
})
