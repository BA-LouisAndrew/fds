import { PrismaClient } from "@prisma/client"

import { ApiResponse } from "@/types/api"
import { BooleanCondition, Condition, ValidationRule } from "@/types/rule"

import { Context } from "./context"
import { resolvePrismaType } from "./resolver"

export class Database {
  private static context: Context

  constructor(context: Context) {
    Database.context = context
  }

  private static get prisma(): PrismaClient {
    return this.context.prisma
  }

  async init() {
    await Database.prisma.$connect()
  }

  static async getRule(ruleName: string): Promise<ApiResponse<ValidationRule>> {
    try {
      const data = await this.prisma.validationRule.findFirst({
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
      const newRule = await this.prisma.validationRule.create({
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
      const newRule = await this.prisma.validationRule.update({
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
      await this.prisma.validationRule.delete({
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
