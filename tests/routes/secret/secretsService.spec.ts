import { createMockContext, MockContext } from "@/engine/database/context"
import { Database } from "@/engine/database/database"
import { SecretsService } from "@/routes/secret/secretsService"
import { sampleSecret } from "@/seed/secrets"

describe("Rules Service class", () => {
  let mockContext: MockContext

  beforeEach(async () => {
    mockContext = createMockContext()
    await new Database(mockContext).init()
  })

  it("should list the keys of available secrets", async () => {
    mockContext.prisma.secret.findMany.mockResolvedValue([sampleSecret])

    const result = await SecretsService.listSecretKeys()
    expect(result.data).toEqual([sampleSecret.key])
  })

  it("should create a new secret if the parameter is correct", async () => {
    mockContext.prisma.secret.create.mockResolvedValue(sampleSecret)

    const result = await SecretsService.createSecretEntry(sampleSecret)
    expect(result.data).toEqual(true)
  })

  it("should update the secret if parameter is correct", async () => {
    mockContext.prisma.secret.update.mockResolvedValue(sampleSecret)

    const result = await SecretsService.updateSecretValue(sampleSecret)
    expect(result.data).toEqual(true)
  })

  it("should delete a secret if it exists", async () => {
    mockContext.prisma.secret.delete.mockResolvedValue(sampleSecret)
    const result = await SecretsService.deleteSecretEntry(sampleSecret.key)
    expect(result.data).toEqual(true)
  })
})
