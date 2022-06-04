import { Prisma, Secret as PrismaSecret, ValidationRule as PrismaValidationRule } from "@prisma/client"

import {
  BooleanCondition,
  Condition,
  GenericObject,
  RetryStrategy,
  ValidationRule as TSValidationRule,
} from "@/types/rule"
import { Secret as TSSecret } from "@/types/secret"

export const resolvePrismaType = (validationRule: PrismaValidationRule): TSValidationRule => ({
  ...validationRule,
  method: validationRule.method as TSValidationRule["method"],
  condition: validationRule.condition as BooleanCondition | Condition,
  retryStrategy: (validationRule.retryStrategy as RetryStrategy) ?? undefined,
  requestUrlParameter: (validationRule.requestUrlParameter as GenericObject) ?? undefined,
  requestBody: (validationRule.requestBody as GenericObject) ?? undefined,
  requestHeader: (validationRule.requestHeader as GenericObject) ?? undefined,
})

export const resolveTSType = (validationRule: TSValidationRule): Omit<PrismaValidationRule, "id"> => ({
  ...validationRule,
  condition: validationRule.condition as Prisma.JsonValue,
  retryStrategy: (validationRule.retryStrategy as Prisma.JsonValue) ?? null,
  requestUrlParameter: (validationRule.requestUrlParameter as Prisma.JsonValue) ?? null,
  requestBody: (validationRule.requestBody as Prisma.JsonValue) ?? null,
  requestHeader: (validationRule.requestHeader as Prisma.JsonValue) ?? null,
})

export const resolvePrismaSecretType = ({ key, value }: PrismaSecret): TSSecret => ({ key, value })
