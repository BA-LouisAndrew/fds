import { Context, createMockContext, MockContext } from "@/engine/database/context"
import { Database } from "@/engine/database/database"
import { resolveTSType } from "@/engine/database/resolver"
import { sampleRule, sampleRuleWithBoolCondition } from "@/seed/rule"
import { Condition } from "@/types/rule"

describe("Database class", () => {
  let database: Database
  let mockContext: MockContext

  beforeEach(async () => {
    mockContext = createMockContext()
    database = new Database(mockContext)
    await database.init()
  })
  
  it("should retrieve details of a rule if a rule name is provided", async () => {
    mockContext.prisma.validationRule.findFirst.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })
    const result = await Database.getRule(sampleRule.name)
    expect(mockContext.prisma.validationRule.findFirst).toBeCalledWith({
      where: {
        name: sampleRule.name
      }
    })
    expect(result).toEqual({ data: { id: "", ...sampleRule }, error: null })
  })
  
  it("should return an error if the rule that is trying to be accessed doesn't exist", async () => {
    mockContext.prisma.validationRule.findFirst.mockResolvedValue(null)
    const result = await Database.getRule(sampleRule.name)

    expect(result.data).toBe(null)
    expect(result.error).toBeTruthy()
  })

  it("should create a new rule if the parameter is correct", async () => {
    mockContext.prisma.validationRule.create.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })

    const result = await Database.createRule(sampleRule)
    expect(result).toEqual({ data: { id: "", ...sampleRule }, error: null })
  })

  it("should not create a new rule if condition has both 'any' and 'all'", async () => {
    mockContext.prisma.validationRule.create.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })

    const result = await Database.createRule({
      ...sampleRule,
      condition: {
        all: [sampleRule.condition as Condition],
        any: [sampleRule.condition as Condition],
      },
    })

    expect(result.data).toBe(null)
    expect(result.error).toBeTruthy()
  })

  it("should update the rule if parameter is correct", async () => {
    mockContext.prisma.validationRule.update.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })
    const { name, ...rule } = sampleRule

    const result = await Database.updateRule(rule, name)

    expect(result).toEqual({ data: { id: "", ...sampleRule }, error: null })
  })

  it("should not update the rule if condition has both 'any' and 'all'", async () => {
    mockContext.prisma.validationRule.update.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })
    const { name, ...rule } = sampleRule

    const result = await Database.updateRule(
      {
        ...rule,
        condition: {
          all: [sampleRule.condition as Condition],
          any: [sampleRule.condition as Condition],
        },
      },
      name,
    )

    expect(result.data).toBe(null)
    expect(result.error).toBeTruthy()
  })
  
  it("should delete a rule if it exists",async () => {
    mockContext.prisma.validationRule.delete.mockResolvedValue({ id: "", ...resolveTSType(sampleRule) })
    const result = await Database.deleteRule(sampleRule.name)

    expect(mockContext.prisma.validationRule.delete).toBeCalledWith({
      where: {
        name: sampleRule.name
      }
    })
    
    expect(result).toEqual({ data: { success: true }, error: null })
  })

  it.skip("should return an error if rule to be deleted doesn't exist", () => {
    // 
  })
})
