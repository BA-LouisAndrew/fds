import { v4 } from "uuid"

import { ValidationRule } from "@/types/rule"
import { CheckResult, Validation } from "@/types/validation"

import { EvaluationResult } from "./condition/evaluator"
import { EvaluatorFactory } from "./condition/evaluatorFactory"
import { Agent } from "./request/agent"

export class ValidationEngine<T> {
  private validation: Validation<T>

  async validateRuleset(): Promise<Validation<T>> {
    return this.validation
  }

  async validateSingleRule(rule: ValidationRule, data: T): Promise<Validation<T>> {
    await this.constructValidationObject([rule], data)

    const evaluationResult = await this.evaluateRule(rule, data)
    const checkResult: CheckResult = {
      name: rule.name,
      date: new Date().toISOString(),
      messages: evaluationResult.messages,
    }

    if (!evaluationResult.pass) {
      this.validation.fraudScore += rule.failScore
      this.validation.failedChecks.push(checkResult)
    } else {
      this.validation.passedChecks.push(checkResult)
    }

    this.validation.additionalInfo.endDate = new Date().toISOString()

    return this.validation
  }

  private async constructValidationObject(checks: ValidationRule[], data: T) {
    const validationId = await this.createValidationId()
    this.validation = {
      validationId,
      fraudScore: 0,
      totalChecks: checks.length,
      runnedChecks: 0,
      currentlyRunning: undefined,
      passedChecks: [],
      failedChecks: [],
      skippedChecks: checks.filter((check) => check.skip).map(({ name }) => name),
      additionalInfo: {
        startDate: new Date().toISOString(),
        customerInformation: data,
      },
    }
  }

  private async evaluateRule(rule: ValidationRule, data: T): Promise<EvaluationResult> {
    const { endpoint, retryStrategy, condition } = rule
    const { error, data: responseData } = await Agent.fireRequest(rule, data)
    if (error) {
      return {
        messages: [`${endpoint} is not accessible.${retryStrategy ? ` Retries done: ${retryStrategy.limit}` : ""}`, error.message],
        pass: false,
      }
    }

    const evaluator = EvaluatorFactory.getEvaluator(condition)
    return evaluator.evaluate(responseData)
  }

  private async createValidationId(): Promise<Validation["validationId"]> {
    const id = v4()
    // TODO See if id exists on DB
    return id
  }
}
