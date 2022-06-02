import request, { SuperTest, Test } from "supertest"

import { MockContext } from "@/engine/database/context"
import { prismaValidationRule, sampleRule } from "@/seed/rule"

import { initTestingServer } from "./setup"

const base = "/api/v1/rules/"

describe("Rules CRUD endpoint", () => {
  let agent: SuperTest<Test>
  let mockContext: MockContext

  beforeAll(async () => {
    const { app, mockContext: ctx } = await initTestingServer()
    agent = request(app)
    mockContext = ctx
  })

  it("GET /rules should return list of rules", async () => {
    mockContext.prisma.validationRule.findMany.mockResolvedValueOnce([prismaValidationRule])

    const response = await agent.get(base)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual([{ id: "", ...sampleRule }])
  })

  it("GET /rules/:ruleName should return a single rule", async () => {
    mockContext.prisma.validationRule.findFirst.mockResolvedValueOnce(prismaValidationRule)

    const response = await agent.get(base + prismaValidationRule.name)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({ id: "", ...sampleRule })
  })

  it("GET /rules/:ruleName should return 404 if rule is not found", async () => {
    mockContext.prisma.validationRule.findFirst.mockResolvedValueOnce(null)

    const response = await agent.get(base + prismaValidationRule.name)
    expect(response.statusCode).toEqual(404)
    expect(response.body.message).toBeTruthy()
  })

  it("POST /rules/ should return 201 if create operation is successful", async () => {
    mockContext.prisma.validationRule.create.mockResolvedValueOnce(prismaValidationRule)

    const response = await agent.post(base).send(sampleRule)
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(expect.objectContaining(sampleRule))
  })

  it("POST /rules/ should return 422 if request body is not correct", async () => {
    mockContext.prisma.validationRule.create.mockResolvedValueOnce(prismaValidationRule)
    const { endpoint: _, ...nonValidBody } = sampleRule

    const response = await agent.post(base).send(nonValidBody)
    expect(response.statusCode).toBe(422)
    expect(response.body.message).toBeTruthy()
  })

  it("PUT /rules/:ruleName should return 200 if update operation is successful", async () => {
    mockContext.prisma.validationRule.update.mockResolvedValueOnce(prismaValidationRule)
    const { name: _, ...validBody } = sampleRule

    const response = await agent.put(base + prismaValidationRule.name).send(validBody)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining(sampleRule))
  })

  it("PUT /rules/:ruleName should return 422 if request body is invalid", async () => {
    mockContext.prisma.validationRule.update.mockResolvedValueOnce(prismaValidationRule)

    const response = await agent.put(base + prismaValidationRule.name).send(sampleRule) // containing `name`
    expect(response.statusCode).toBe(422)
    expect(response.body.message).toBeTruthy()
  })

  it("DELETE /rules/:ruleName should return 204 if delete operation is successful", async () => {
    mockContext.prisma.validationRule.delete.mockResolvedValueOnce(prismaValidationRule)

    const response = await agent.delete(base + prismaValidationRule.name)
    expect(response.statusCode).toBe(204)
  })
})
