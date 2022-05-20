import { Prisma, ValidationRule as PrismaValidationRule } from "@prisma/client"

import {
  BooleanCondition,
  Condition,
  GenericObject,
  RetryStrategy,
  ValidationRule as TSValidationRule,
} from "@/types/rule"

export const resolvePrismaType = (validationRule: PrismaValidationRule): TSValidationRule => ({
  ...validationRule,
  condition: validationRule.condition as BooleanCondition | Condition,
  retryStrategy: (validationRule.retryStrategy as RetryStrategy) ?? undefined,
  requestUrlParameter: (validationRule.requestUrlParameter as GenericObject) ?? undefined,
  requestBody: (validationRule.requestBody as GenericObject) ?? undefined,
})

export const resolveTSType = (validationRule: TSValidationRule): Omit<PrismaValidationRule, "id"> => ({
  ...validationRule,
  condition: validationRule.condition as Prisma.JsonValue,
  retryStrategy: (validationRule.retryStrategy as Prisma.JsonValue) ?? null,
  requestUrlParameter: (validationRule.requestUrlParameter as Prisma.JsonValue) ?? null,
  requestBody: (validationRule.requestBody as Prisma.JsonValue) ?? null,
})