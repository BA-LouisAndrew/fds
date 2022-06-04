import request, { SuperTest, Test } from "supertest"

import { MockContext } from "@/engine/database/context"
import { samplePrismaSecret, sampleSecret } from "@/seed/secrets"

import { initTestingServer } from "./setup"

const base = "/api/v1/secrets/"

describe("Secrets CRUD endpoint", () => {
  let agent: SuperTest<Test>
  let mockContext: MockContext

  beforeAll(async () => {
    const { app, mockContext: ctx } = await initTestingServer()
    agent = request(app)
    mockContext = ctx
  })

  it("GET /secrets should return list of rules", async () => {
    mockContext.prisma.secret.findMany.mockResolvedValueOnce([samplePrismaSecret])

    const response = await agent.get(base)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual([samplePrismaSecret.key])
  })

  it("POST /secrets/ should return 201 if create operation is successful", async () => {
    mockContext.prisma.secret.create.mockResolvedValueOnce(samplePrismaSecret)

    const response = await agent.post(base).send(sampleSecret)
    expect(response.statusCode).toBe(201)
  })

  it("POST /secrets/ should return 422 if request body is not correct", async () => {
    mockContext.prisma.secret.create.mockResolvedValueOnce(samplePrismaSecret)
    const { value: _, ...nonValidBody } = samplePrismaSecret

    const response = await agent.post(base).send(nonValidBody)
    expect(response.statusCode).toBe(422)
    expect(response.body.message).toBeTruthy()
  })

  it("PUT /secrets/:secretKey should return 200 if update operation is successful", async () => {
    mockContext.prisma.secret.update.mockResolvedValueOnce(samplePrismaSecret)
    const { key: _, ...validBody } = sampleSecret

    const response = await agent.put(base + samplePrismaSecret.key).send(validBody)
    expect(response.statusCode).toBe(200)
  })

  it("PUT /secrets/:secretKey should return 422 if request body is invalid", async () => {
    mockContext.prisma.secret.update.mockResolvedValueOnce(samplePrismaSecret)

    const response = await agent.put(base + samplePrismaSecret.key).send(sampleSecret) // containing `key`
    expect(response.statusCode).toBe(422)
    expect(response.body.message).toBeTruthy()
  })

  it("DELETE /secrets/:secretKey should return 204 if delete operation is successful", async () => {
    mockContext.prisma.secret.delete.mockResolvedValueOnce(samplePrismaSecret)

    const response = await agent.delete(base + samplePrismaSecret.key)
    expect(response.statusCode).toBe(204)
  })
})
