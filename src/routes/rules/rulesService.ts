import { Database } from "@/engine/database/database"
import { resolvePrismaType } from "@/engine/database/resolver"
import { ApiResponse } from "@/types/api"
import { BooleanCondition, Condition, ValidationRule } from "@/types/rule"

export class RulesService {
  static async getRule(ruleName: string): Promise<ApiResponse<ValidationRule>> {
    try {
      const data = await Database.validationRule.findFirst({
        where: {
          name: ruleName,
        },
      })

      if (!data) {
        return {
          error: {
            message: `Rule with rule name ${ruleName} doesn't exist!`,
          },
          data,
        }
      }

      return {
        data: resolvePrismaType(data),
        error: null,
      }
    } catch (e) {
      return {
        error: {
          message: e as string,
        },
        data: null,
      }
    }
  }

  static async createRule(validationRule: ValidationRule): Promise<ApiResponse<ValidationRule>> {
    const { condition } = validationRule

    const { isValid, message } = this.validateCondition(condition)
    if (!isValid) {
      return {
        error: {
          message,
        },
        data: null,
      }
    }

    try {
      const newRule = await Database.validationRule.create({
        data: validationRule,
      })

      return { data: resolvePrismaType(newRule), error: null }
    } catch (e) {
      return {
        error: {
          message: e as string,
        },
        data: null,
      }
    }
  }

  static async updateRule(
    validationRule: Omit<ValidationRule, "name">,
    ruleName: string,
  ): Promise<ApiResponse<ValidationRule>> {
    const { condition } = validationRule

    const { isValid, message } = this.validateCondition(condition)
    if (!isValid) {
      return {
        error: {
          message,
        },
        data: null,
      }
    }

    try {
      const newRule = await Database.validationRule.update({
        data: validationRule,
        where: {
          name: ruleName,
        },
      })
      return { data: resolvePrismaType(newRule), error: null }
    } catch (e) {
      return {
        error: {
          message: e as string,
        },
        data: null,
      }
    }
  }

  static async deleteRule(ruleName: string): Promise<ApiResponse<{ success: true }>> {
    try {
      await Database.validationRule.delete({
        where: {
          name: ruleName,
        },
      })

      return {
        data: {
          success: true,
        },
        error: null,
      }
    } catch {
      // TODO: check what happens if rule doesn't exist
      return {
        error: {
          message: "",
        },
        data: null,
      }
    }
  }

  private static validateCondition(condition: Condition | BooleanCondition): { isValid: boolean; message: string } {
    const conditionKeys = Object.keys(condition)
    const isUsingAny = conditionKeys.includes("any")
    const isUsingAll = conditionKeys.includes("all")

    if (isUsingAll && isUsingAny) {
      return {
        isValid: false,
        message: "Please use either 'any' or 'all', not both of them.",
      }
    }

    // TODO: validate operator
    return {
      isValid: true,
      message: "",
    }
  }
}
