import { v4 } from "uuid"

import { ValidationRule } from "@/types/rule"
import { CheckResult, Validation } from "@/types/validation"

import { EvaluationResult } from "./condition/evaluator"
import { EvaluatorFactory } from "./condition/evaluatorFactory"
import { Agent } from "./request/agent"

export class ValidationEngine<T> {
  private validation: Validation<T>
  private fraudScores: number[]

  private get validationResult(): Validation<T> {
    return { ...this.validation, fraudScore: this.resultingFraudScore }
  }

  private get resultingFraudScore() {
    return this.fraudScores.reduce((a, b) => a + b, 0) / this.fraudScores.length
  }

  private get runnableRules() {
    return this.validation.totalChecks - this.validation.skippedChecks.length
  }
  
  async scheduleRulesetValidation(ruleset: ValidationRule[], data: T): Promise<Validation<T>> {
    await this.constructValidationObject(ruleset, data)
    this.validateRuleset(ruleset, data)
    
    return this.validationResult
  }

  async validateRuleset(ruleset: ValidationRule[], data: T): Promise<Validation<T>> {
    if (!this.validation) {
      await this.constructValidationObject(ruleset, data) // Override flow for testing
    }

    for await (const rule of ruleset.filter(({ skip }) => !skip)) {
      const evaluationResult = await this.evaluateRule(rule, data)
      this.reviewEvaluationResult(evaluationResult, rule)
    }

    return this.validationResult
  }

  async validateSingleRule(rule: ValidationRule, data: T): Promise<Validation<T>> {
    await this.constructValidationObject([rule], data)

    const evaluationResult = await this.evaluateRule(rule, data)
    this.reviewEvaluationResult(evaluationResult, rule)

    this.validation.additionalInfo.endDate = new Date().toISOString()

    return this.validationResult
  }

  private async constructValidationObject(ruleset: ValidationRule[], data: T) {
    const validationId = await this.createValidationId()
    this.validation = {
      validationId,
      fraudScore: 0,
      totalChecks: ruleset.length,
      runnedChecks: 0,
      currentlyRunning: undefined,
      passedChecks: [],
      failedChecks: [],
      skippedChecks: ruleset.filter((check) => check.skip).map(({ name }) => name),
      additionalInfo: {
        startDate: new Date().toISOString(),
        customerInformation: data,
      },
    }
    this.fraudScores = []
  }

  private async evaluateRule(rule: ValidationRule, data: T): Promise<EvaluationResult> {
    const { endpoint, retryStrategy, condition } = rule
    const { error, data: responseData } = await Agent.fireRequest(rule, data)
    if (error) {
      return {
        messages: [
          `${endpoint} is not accessible.${retryStrategy ? ` Retries done: ${retryStrategy.limit}` : ""}`,
          error.message,
        ],
        pass: false,
      }
    }

    const evaluator = EvaluatorFactory.getEvaluator(condition)
    return evaluator.evaluate(responseData)
  }

  private async reviewEvaluationResult(evaluationResult: EvaluationResult, rule: ValidationRule) {
    const checkResult: CheckResult = {
      name: rule.name,
      date: new Date().toISOString(),
      messages: evaluationResult.messages,
    }
    
    console.log({ checkResult })

    if (!evaluationResult.pass) {
      this.validation.failedChecks.push(checkResult)
      this.fraudScores.push(rule.failScore) // Increase the average
    } else {
      this.validation.passedChecks.push(checkResult)
      this.fraudScores.push(0) // Decrease the average
    }
  }

  private async createValidationId(): Promise<Validation["validationId"]> {
    const id = v4()
    // TODO See if id exists on DB
    return id
  }
}
