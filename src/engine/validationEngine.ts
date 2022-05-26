import { v4 } from "uuid"

import { sampleValidation } from "@/seed/validation"
import { ValidationRule } from "@/types/rule"
import { Validation } from "@/types/validation"

import { EvaluationResult } from "./condition/evaluator"
import { EvaluatorFactory } from "./condition/evaluatorFactory"
import { Agent } from "./request/agent"

export class ValidationEngine<T> {
  async validateRuleset(): Promise<Validation> {
    return sampleValidation
  }

  async validateSingleRule(rule: ValidationRule, data: T): Promise<Validation> {
    // TODO
    console.log({ rule })
    return sampleValidation
  }

  private async evaluateRule(rule: ValidationRule, data: T): Promise<EvaluationResult> {
    const { endpoint, retryStrategy, condition } = rule
    const { error, data: responseData } = await Agent.fireRequest(rule, data)
    if (error) {
      return {
        messages: [`${endpoint} is not accessible.${retryStrategy && ` Retries done: ${retryStrategy.limit}`}`],
        pass: false,
      }
    }

    const { statusCode, statusMessage, body, rawBody, retryCount } = responseData
    const evaluator = EvaluatorFactory.getEvaluator(condition)
    return evaluator.evaluate({ statusCode, statusMessage, body, rawBody, retryCount })
  }

  private async createValidationId(): Promise<Validation["validationId"]> {
    const id = v4()
    // TODO See if id exists on DB
    return id
  }
}
