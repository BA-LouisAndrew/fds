import { Response } from "express"
import { vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"

import { DataStore } from "@/engine/data/dataStore"
import { initStore } from "@/engine/data/initStore"
import { createMockContext } from "@/engine/database/context"
import { Database } from "@/engine/database/database"
import { EventBus } from "@/eventBus"
import { ValidationService } from "@/routes/validation/validationService"
import { sampleCustomer } from "@/seed/customer"
import { prismaValidationRule } from "@/seed/rule"
import { minifiedValidation, sampleValidation } from "@/seed/validation"

const scheduleRulesetValidation = vi.fn()
function ValidationEngine() {
  this.scheduleRulesetValidation = scheduleRulesetValidation
}

vi.mock("@/engine/validationEngine", () => ({
  ValidationEngine,
}))

describe("Validation service class", () => {
  const mockContext = createMockContext()
  const validationId = "52907745-7672-470e-a803-a2f8feb52944"

  beforeAll(async () => {
    await new Database(mockContext).init()
    await initStore("in-memory").init()
  })

  it("passes the ruleset from the database to be validated", async () => {
    mockContext.prisma.validationRule.findMany.mockResolvedValue([prismaValidationRule])
    scheduleRulesetValidation.mockResolvedValueOnce({ validationId: "Hi-there", additionalInfo: {} })

    const { data } = await ValidationService.scheduleRulesetValidation(sampleCustomer)

    expect(scheduleRulesetValidation).toBeCalled()
    expect(scheduleRulesetValidation).toBeCalledWith(
      [
        {
          ...prismaValidationRule,
          requestBody: undefined,
          requestUrlParameter: undefined,
          retryStrategy: undefined,
        },
      ],
      expect.anything(),
    )

    expect(data?.validationId).toEqual("Hi-there")
  })

  it("sends an event to the response if a validation event is done", async () => {
    const responseObject = mockDeep<Response>()
    await DataStore.getInstance().set(validationId, "{}")

    await ValidationService.subscribeToValidationProgress(validationId, responseObject)
    expect(responseObject.write).toBeCalledWith("data: {}\n\n")

    EventBus.emit(`${EventBus.EVENTS.VALIDATION_EVENT_UPDATE}--${validationId}`, sampleValidation)
    expect(responseObject.write).toBeCalledWith(`data: ${JSON.stringify(sampleValidation)}\n\n`)
  })

  it("sends a `close` event to the response if validation is done", async () => {
    const responseObject = mockDeep<Response>()
    await DataStore.getInstance().set(validationId, JSON.stringify(sampleValidation))

    await ValidationService.subscribeToValidationProgress(validationId, responseObject)

    EventBus.emit(`${EventBus.EVENTS.VALIDATION_DONE}--${validationId}`)
    expect(responseObject.write).lastCalledWith(`data: ${JSON.stringify({ close: true })}\n\n`)
  })

  it("retrieves a list of validations", async () => {
    await DataStore.getInstance().flush()
    await DataStore.getInstance().set(DataStore.VALIDATION_PREFIX + "test", JSON.stringify(sampleValidation))
    await DataStore.getInstance().set(DataStore.VALIDATION_PREFIX + "test-b", JSON.stringify(sampleValidation))

    const validationList = await ValidationService.getValidationList()

    expect(validationList.data).toEqual([minifiedValidation, minifiedValidation])
  })

  it("returns an empty array if no validation is available", async () => {
    await DataStore.getInstance().flush()

    const validationList = await ValidationService.getValidationList()
    expect(validationList.data).toEqual([])
  })
})
