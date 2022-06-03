import nock from "nock"

import { initStore } from "@/engine/data/initStore"
import { Agent } from "@/engine/request/agent"
import { createContext } from "@/engine/request/context"
import { ValidationEngine } from "@/engine/validationEngine"
import { ValidationRule } from "@/types/rule"

describe("Validation engine: Validate rule set", () => {
  beforeAll(async () => {
    Agent.setClient(createContext())
    await initStore("in-memory").init()
  })

  const ruleA: ValidationRule = {
    skip: false,
    condition: {
      path: "$.response.statusCode",
      operator: "eq",
      type: "number",
      value: 200,
      failMessage: "Status code doesn't equal to 200",
    },
    name: "sample-rule",
    priority: 0,
    endpoint: "http://localhost:5001/validate",
    method: "GET",
    failScore: 0.1,
  }

  const ruleB: ValidationRule = {
    skip: false,
    condition: {
      all: [
        {
          path: "$.response.statusCode",
          operator: "eq",
          type: "number",
          value: 201,
          failMessage: "Status code doesn't equal to 201",
        },
        {
          path: "$.response.body.message",
          type: "string",
          operator: "eq",
          value: "Operation successful",
          failMessage: "Message is not right",
        },
      ],
    },
    name: "sample-rule-2",
    priority: 10,
    endpoint: "http://localhost:5003/validate",
    method: "POST",
    failScore: 0.5,
  }

  const ruleset = [ruleA, ruleB]

  it("returns the correct value if the validation for both rules succeed", async () => {
    nock("http://localhost:5001").get("/validate").reply(200)
    nock("http://localhost:5003").post("/validate").reply(201, { message: "Operation successful" })

    const result = await new ValidationEngine().validateRuleset(ruleset, {})

    expect(result.fraudScore).toEqual(0)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(2)
    expect(result.failedChecks.length).toEqual(0)
  })

  it("returns the correct value if one of the validation failed", async () => {
    nock("http://localhost:5001").get("/validate").reply(200)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine().validateRuleset(ruleset, {})

    expect(result.fraudScore).toEqual(0.25)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(1)
    expect(result.failedChecks.length).toEqual(1)
  })

  it("returns the correct value if both of the validation failed", async () => {
    nock("http://localhost:5001").get("/validate").reply(400)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine().validateRuleset(ruleset, {})

    expect(result.fraudScore).toEqual(0.3)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(2)
  })

  it("skips evaluating a rule if the `skip` property is set", async () => {
    nock("http://localhost:5001").get("/validate").reply(201)
    nock("http://localhost:5003").post("/validate").reply(204, { message: "Operation successful" })

    const result = await new ValidationEngine().validateRuleset(
      [
        {
          ...ruleA,
          skip: true,
        },
        ruleB,
      ],
      {},
    )

    expect(result.fraudScore).toEqual(0.5)
    expect(result.totalChecks).toEqual(2)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(1)
    expect(result.skippedChecks.length).toEqual(1)
  })
})
