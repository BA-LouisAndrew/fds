import nock from "nock"

import { initStore } from "@/engine/data/initStore"
import { Agent } from "@/engine/request/agent"
import { createContext } from "@/engine/request/context"
import { ValidationEngine } from "@/engine/validationEngine"
import { ValidationRule } from "@/types/rule"

describe("Validation engine: Validate single rule", () => {
  beforeAll(async () => {
    Agent.setClient(createContext())
    await initStore("in-memory").init()
  })

  const rule: ValidationRule = {
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
    endpoint: "http://localhost/5001/validate",
    method: "GET",
    failScore: 0.1,
  }

  it("returns a correct result for successful validation with a single condition", async () => {
    nock("http://localhost/5001").get("/validate").reply(200)
    const result = await new ValidationEngine().setRuleset([rule]).validateSingleRule({})

    expect(result.fraudScore).toEqual(0)
    expect(result.totalChecks).toEqual(1)
    expect(result.passedChecks.length).toEqual(1)
    expect(result.failedChecks.length).toEqual(0)
  })

  it("returns a correct result for unsuccessful validation with a single condition", async () => {
    nock("http://localhost/5001").get("/validate").reply(404)
    const result = await new ValidationEngine().setRuleset([rule]).validateSingleRule({})

    expect(result.fraudScore).toEqual(rule.failScore)
    expect(result.totalChecks).toEqual(1)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(1)
  })

  it("returns a correct result for successful validation with a boolean condition", async () => {
    nock("http://localhost/5001").get("/validate").reply(200, { success: true })
    const result = await new ValidationEngine()
      .setRuleset([
        {
          ...rule,
          condition: {
            all: [
              {
                path: "$.response.statusCode",
                operator: "eq",
                type: "number",
                value: 200,
                failMessage: "Status code doesn't equal to 200",
              },
              {
                path: "$.response.body.success",
                operator: "eq",
                type: "boolean",
                value: true,
                failMessage: "It fails!",
              },
            ],
          },
        },
      ])
      .validateSingleRule({})

    expect(result.fraudScore).toEqual(0)
    expect(result.totalChecks).toEqual(1)
    expect(result.passedChecks.length).toEqual(1)
    expect(result.failedChecks.length).toEqual(0)
  })

  it("returns a correct result for successful validation with a boolean condition", async () => {
    nock("http://localhost/5001").get("/validate").reply(200, { success: false })
    const result = await new ValidationEngine()
      .setRuleset([
        {
          ...rule,
          condition: {
            all: [
              {
                path: "$.response.statusCode",
                operator: "eq",
                type: "number",
                value: 200,
                failMessage: "Status code doesn't equal to 200",
              },
              {
                path: "$.response.body.success",
                operator: "eq",
                type: "boolean",
                value: true,
                failMessage: "It fails!",
              },
            ],
          },
        },
      ])
      .validateSingleRule({})

    expect(result.fraudScore).toEqual(rule.failScore)
    expect(result.totalChecks).toEqual(1)
    expect(result.passedChecks.length).toEqual(0)
    expect(result.failedChecks.length).toEqual(1)
    expect(result.failedChecks[0].messages).toContain("It fails!")
  })
})
