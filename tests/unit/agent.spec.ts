import { mockReset } from "vitest-mock-extended"

import { Agent } from "@/engine/request/agent"
import { createMockContext, MockContext } from "@/engine/request/context"
import { sampleRule } from "@/seed/rule"
import { ValidationRule } from "@/types/rule"

describe("Agent", () => {
  const mockContext: MockContext = createMockContext()
  Agent.setClient(mockContext)

  afterEach(() => mockReset(mockContext))

  it("passes the correct parameter to the request body", async () => {
    const rule: ValidationRule = {
      ...sampleRule,
      method: "POST",
      requestBody: {
        user: "$.firstName",
        foo: "bar",
      },
    }

    const data = {
      firstName: "Elon",
    }

    await Agent.fireRequest(rule, data)

    expect(mockContext.client).toBeCalledWith(
      expect.any(String),
      expect.objectContaining({
        json: {
          user: "Elon",
          foo: "bar",
        },
      }),
    )
  })

  it("fires an HTTP request to the correct endpoint", async () => {
    await Agent.fireRequest(sampleRule, {})

    expect(mockContext.client).toBeCalledWith(sampleRule.endpoint, expect.anything())
  })

  it("fires an HTTP request with the correct HTTP method", async () => {
    await Agent.fireRequest(sampleRule, {})

    expect(mockContext.client).toBeCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: sampleRule.method,
      }),
    )
  })

  it("passes the correct `retryStrategy` to the agent", async () => {
    const rule = {
      ...sampleRule,
      retryStrategy: {
        limit: 3,
        statusCodes: [401, 500],
      },
    }
    await Agent.fireRequest(rule, {})

    expect(mockContext.client).toBeCalledWith(
      expect.any(String),
      expect.objectContaining({
        retry: expect.objectContaining(rule.retryStrategy),
      }),
    )
  })

  it("does not pass any request body if it is undefined", async () => {
    const rule = {
      ...sampleRule,
      requestBody: undefined,
    }
    await Agent.fireRequest(rule, {})

    expect(mockContext.client).not.toBeCalledWith(expect.anything(), expect.objectContaining({
      json: expect.anything()
    }))
  })

  it.skip("passes the correct parameters to the URL")
})
