import { PrismaClient } from "@prisma/client"

import { DataStore } from "@/engine/data/dataStore"
import { ValidationRule } from "@/types/rule"
import { isObject } from "@/utils/isObject"

import { Context } from "./context"

export class Database {
  private static context: Context
  private static cache: DataStore

  constructor(context: Context) {
    Database.context = context
  }

  static setCache(cache: DataStore) {
    this.cache = cache
    if (process.env.NODE_ENV !== "test") {
      console.log("> Cache is set")
    }
  }

  private static get prisma(): PrismaClient {
    return this.context.prisma
  }

  static get validationRule() {
    return this.prisma.validationRule
  }

  static get secret() {
    return this.prisma.secret
  }

  static async cacheValidationRule(rule: ValidationRule): Promise<void> {
    if (!this.cache) {
      return
    }

    await this.cache.set(DataStore.getRuleKey(rule.name), JSON.stringify(rule))
  }

  static async getCachedValidationRule(ruleName: string): Promise<ValidationRule | null> {
    if (!this.cache) {
      return null
    }

    const value = await this.cache.get(DataStore.getRuleKey(ruleName))
    if (!value) {
      return null
    }

    try {
      const parsedValue = JSON.parse(value)
      return parsedValue
    } catch {
      return null
    }
  }

  static async _cacheValidationRule(rule: ValidationRule): Promise<void> {
    if (!this.cache) {
      return
    }

    await this.cache.set(`${rule.name}.set`, "true")
    await Promise.all(
      Object.keys(rule).map(async (key) => {
        const value = rule[key]
        const keyName = `${rule.name}.${key}`
        if (isObject(value)) {
          await this.cache.set(keyName, JSON.stringify(value))
        } else {
          await this.cache.set(keyName, `${value}`)
        }
      }),
    )
  }

  static async _getCachedValidationRule(ruleName: string): Promise<ValidationRule | null> {
    if (!this.cache) {
      return null
    }

    const isCached = await this.cache.get(`${ruleName}.set`)
    if (isCached !== "true") {
      return null
    }

    const rulePropertyKeys = [
      "retryStrategy",
      "requestUrlParameter",
      "skip",
      "requestBody",
      "condition",
      "method",
      "failScore",
      "endpoint",
      "priority",
      "name",
    ]

    const values: [string, any][] = await Promise.all(
      rulePropertyKeys.map(async (key) => {
        const keyName = `${ruleName}.${key}`
        const value = await this.cache.get(keyName)

        if (value === "" || value === "undefined") {
          return [key, null]
        }

        try {
          const parsedObject = JSON.parse(value)
          return [key, parsedObject]
        } catch {
          return [key, value]
        }
      }),
    )

    return values.reduce(
      (a, [key, value]) => ({
        ...a,
        [key]: value,
      }),
      {},
    ) as ValidationRule
  }

  async init() {
    await Database.prisma.$connect()
    if (process.env.NODE_ENV !== "test") {
      console.log("> Database is up")
    }
  }
}
