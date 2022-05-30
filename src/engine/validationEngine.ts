import { v4 } from "uuid"

import { ValidationRule } from "@/types/rule"
import { Validation, ValidationEventResult, ValidationEventStatus } from "@/types/validation"

import { EvaluationResult } from "./condition/evaluator"
import { EvaluatorFactory } from "./condition/evaluatorFactory"
import { Agent } from "./request/agent"

type ValidationEnginePropertyType<T> = Omit<Validation<T>, "fraudScore" | "passedChecks" | "failedChecks">;

export class ValidationEngine<T> {
  private validation: ValidationEnginePropertyType<T>
  private fraudScores: number[]

  private get validationResult(): Validation<T> {
    return {
      ...this.validation,
      fraudScore: this.resultingFraudScore,
      passedChecks: this.passedChecks,
      failedChecks: this.failedChecks,
    }
  }

  private get resultingFraudScore() {
    return this.fraudScores.reduce((a, b) => a + b, 0) / this.fraudScores.length
  }

  private get passedChecks() {
    return this.getValidationEventResultByStatus("PASSED")
  }

  private get failedChecks() {
    return this.getValidationEventResultByStatus("FAILED")
  }

  private getValidationEventResultByStatus(status: ValidationEventStatus): ValidationEventResult[] {
    return this.validation.events.filter((event) => event.status === status).map(({ status: _, ...event }) => event)
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
    
    await this.afterValidation()	

    return this.validationResult
  }

  async validateSingleRule(rule: ValidationRule, data: T): Promise<Validation<T>> {
    await this.constructValidationObject([rule], data)

    const evaluationResult = await this.evaluateRule(rule, data)
    this.reviewEvaluationResult(evaluationResult, rule)

    await this.afterValidation()

    return this.validationResult
  }

  private async constructValidationObject(ruleset: ValidationRule[], data: T) {
    const validationId = await this.createValidationId()
    this.validation = {
      validationId,
      totalChecks: ruleset.length,
      runnedChecks: 0,
      currentlyRunning: undefined,
      skippedChecks: ruleset.filter((rule) => rule.skip).map(({ name }) => name),
      additionalInfo: {
        startDate: new Date().toISOString(),
        customerInformation: data,
      },
      events: ruleset
        .filter((rule) => !rule.skip)
        .map((rule) => ({
          name: rule.name,
          status: "NOT_STARTED",
          dateStarted: null,
          dateEnded: null,
          messages: [],
        })),
    }
    this.fraudScores = []
  }

  private async evaluateRule(rule: ValidationRule, data: T): Promise<EvaluationResult> {
    const { endpoint, retryStrategy, condition, name } = rule

    const validationEvent = this.validation.events.find((event) => event.name === name)
    if (validationEvent) {
      validationEvent.dateStarted = new Date().toISOString()
      validationEvent.status = "RUNNING"
    }

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
    const { pass, messages } = evaluationResult
    const validationEvent = this.validation.events.find(({ name }) => name === rule.name)
    if (validationEvent) {
      validationEvent.status = pass ? "PASSED" : "FAILED"
      validationEvent.messages = messages
      validationEvent.dateEnded = new Date().toISOString()
    }

    this.fraudScores.push(pass ? 0 : rule.failScore)
  }

  private async createValidationId(): Promise<Validation["validationId"]> {
    const id = v4()
    // TODO See if id exists on DB
    return id
  }
  
  private async afterValidation() {
    this.validation.additionalInfo.endDate = new Date().toISOString()
    
    console.log(this.validationResult)
  }
}
