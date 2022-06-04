import { createMockContext, MockContext } from "@/engine/database/context"
import { Database } from "@/engine/database/database"
import { SecretsService } from "@/routes/secret/secretsService"
import { samplePrismaSecret } from "@/seed/secrets"

describe("Rules Service class", () => {
  let mockContext: MockContext

  beforeEach(async () => {
    mockContext = createMockContext()
    await new Database(mockContext).init()
  })

  it("should list the keys of available secrets", async () => {
    mockContext.prisma.secret.findMany.mockResolvedValue([samplePrismaSecret])

    const result = await SecretsService.listSecretKeys()
    expect(result.data).toEqual([samplePrismaSecret.key])
  })

  it("should create a new secret if the parameter is correct", async () => {
    mockContext.prisma.secret.create.mockResolvedValue(samplePrismaSecret)

    const result = await SecretsService.createSecretEntry(samplePrismaSecret)
    expect(result.data).toEqual(true)
  })

  it("should update the secret if parameter is correct", async () => {
    mockContext.prisma.secret.update.mockResolvedValue(samplePrismaSecret)

    const result = await SecretsService.updateSecretValue(samplePrismaSecret)
    expect(result.data).toEqual(true)
  })

  it("should delete a secret if it exists", async () => {
    mockContext.prisma.secret.delete.mockResolvedValue(samplePrismaSecret)
    const result = await SecretsService.deleteSecretEntry(samplePrismaSecret.key)
    expect(result.data).toEqual(true)
  })
})
