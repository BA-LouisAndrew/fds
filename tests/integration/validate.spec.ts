import request, { SuperTest, Test } from "supertest"
import { vi } from "vitest"

import { DataStore } from "@/engine/data/dataStore"
import { MockContext } from "@/engine/database/context"
import { sampleCustomer } from "@/seed/customer"
import { prismaValidationRule } from "@/seed/rule"
import { minifiedValidation, sampleValidation, validationSchedule } from "@/seed/validation"

import { initTestingServer } from "./setup"

const base = "/api/v1/validate/"

const scheduleRulesetValidation = vi.fn()
function ValidationEngine() {
  this.scheduleRulesetValidation = scheduleRulesetValidation
}

vi.mock("@/engine/validationEngine", () => ({
  ValidationEngine,
}))

describe("Validations endpoint", () => {
  let agent: SuperTest<Test>
  let mockContext: MockContext
  let dataStore: DataStore

  beforeAll(async () => {
    const { app, mockContext: ctx, store } = await initTestingServer()
    agent = request(app)
    mockContext = ctx
    dataStore = store
  })

  afterEach(async () => {
    await dataStore.flush()
  })

  it("POST /validate should schedule an async validation", async () => {
    scheduleRulesetValidation.mockResolvedValue(validationSchedule)
    mockContext.prisma.validationRule.findMany.mockResolvedValueOnce([prismaValidationRule])

    const response = await agent.post(base).send(sampleCustomer)

    expect(response.statusCode).toEqual(201)
    expect(response.body.validationId).toEqual(validationSchedule.validationId)

    expect(scheduleRulesetValidation).toBeCalled()
  })

  it("POST /validate should return a 422 if request body is not valid", async () => {
    scheduleRulesetValidation.mockResolvedValue(validationSchedule)
    mockContext.prisma.validationRule.findMany.mockResolvedValueOnce([prismaValidationRule])

    const { address: _, ...invalid } = sampleCustomer
    const response = await agent.post(base).send(invalid)

    expect(response.statusCode).toEqual(422)
  })

  it("GET /validate/list should return list of validations, both running and done available in datastore", async () => {
    await dataStore.set(DataStore.getValidationKey(sampleValidation.validationId), JSON.stringify(minifiedValidation))

    const response = await agent.get(base + "list")
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual([minifiedValidation])
  })

  it("GET /validate/list should return an empty array if no validation is present", async () => {
    const response = await agent.get(base + "list")
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual([])
  })
})
