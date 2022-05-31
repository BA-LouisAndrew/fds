import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { Database } from "@/engine/database/database"
import { resolvePrismaType } from "@/engine/database/resolver"
import { ApiErrorResponse, ApiResponse, ServiceValidationReturnType } from "@/types/api"
import { BooleanCondition, Condition, RetryStrategy, ValidationRule } from "@/types/rule"

export type UpdateRuleRequestBody = Partial<Omit<ValidationRule, "name">>

export class RulesService {
  static async listRules(): Promise<ApiResponse<ValidationRule[]>> {
    try {
      const data = await Database.validationRule.findMany()

      return {
        data: data.map(resolvePrismaType),
        error: null,
      }
    } catch (e) {
      return this.handleError(e)
    }
  }

  static async getRule(ruleName: string): Promise<ApiResponse<ValidationRule>> {
    try {
      const cachedValue = await Database.getCachedValidationRule(ruleName)
      if (cachedValue) {
        return {
          data: cachedValue,
          error: null,
        }
      }

      const data = await Database.validationRule.findFirst({
        where: {
          name: ruleName,
        },
      })

      if (!data) {
        return {
          error: {
            message: `Rule with rule name '${ruleName}' doesn't exist!`,
          },
          data,
        }
      }

      const validationRule = resolvePrismaType(data)
      await Database.cacheValidationRule(validationRule)
      return {
        data: validationRule,
        error: null,
      }
    } catch (e) {
      return this.handleError(e)
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

      const createdRule = resolvePrismaType(newRule)
      await Database.cacheValidationRule(createdRule)
      return { data: createdRule, error: null }
    } catch (e) {
      return this.handleError(e, validationRule)
    }
  }

  static async updateRule(
    validationRule: UpdateRuleRequestBody,
    ruleName: string,
  ): Promise<ApiResponse<ValidationRule>> {
    const { condition } = validationRule

    if (condition) {
      const { isValid, message } = this.validateCondition(condition)
      if (!isValid) {
        return {
          error: {
            message,
          },
          data: null,
        }
      }
    }

    try {
      const newRule = await Database.validationRule.update({
        data: validationRule,
        where: {
          name: ruleName,
        },
      })

      const updatedRule = resolvePrismaType(newRule)
      await Database.cacheValidationRule(updatedRule)
      return { data: updatedRule, error: null }
    } catch (e) {
      return this.handleError(e, validationRule)
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
    } catch (e) {
      return this.handleError(e, { name: ruleName })
    }
  }

  private static validateRetryStrategy(retryStrategy: RetryStrategy): ServiceValidationReturnType {
    // TODO
    return { isValid: true, message: "" }
  }

  private static validateCondition(condition: Condition | BooleanCondition): ServiceValidationReturnType {
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

  private static handleError(e: unknown, payload: any = {}): ApiErrorResponse {
    console.log(JSON.stringify(e))

    if (e instanceof PrismaClientKnownRequestError) {
      if (e.meta?.cause) {
        return {
          error: {
            message: e.meta.cause as string,
          },
          data: null,
        }
      }

      switch (e.code) {
        case "P2002":
          return {
            error: {
              message: `Rule with name '${payload?.name}' already exists!`,
            },
            data: null,
          }
        case "P2025":
          return {
            error: {
              message: `Rule with name '${payload?.name}' doesn't exist`,
            },
            data: null,
          }
        default:
          return {
            error: {
              message: e.message,
            },
            data: null,
          }
      }
    }

    return {
      error: {
        message: "",
      },
      data: null,
    }
  }
}
