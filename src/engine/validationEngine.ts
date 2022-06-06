import { v4 } from "uuid"

import { EventBus } from "@/eventBus"
import { GenericObject, ValidationRule } from "@/types/rule"
import { Validation, ValidationEventResult, ValidationEventStatus } from "@/types/validation"

import { EvaluationResult } from "./condition/evaluator"
import { EvaluatorFactory } from "./condition/evaluatorFactory"
import { DataStore } from "./data/dataStore"
import { Notification } from "./notification"
import { Agent } from "./request/agent"

type ValidationEnginePropertyType<T> = Omit<Validation<T>, "fraudScore" | "passedChecks" | "failedChecks">

export class ValidationEngine<T> {
  private validation: ValidationEnginePropertyType<T>
  private fraudScores: number[]
  private store = DataStore.getInstance()

  private secrets: GenericObject = {}
  private ruleset: ValidationRule[] = []

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

  setSecrets(secrets: GenericObject) {
    this.secrets = secrets
    return this
  }

  setRuleset(ruleset: ValidationRule[]) {
    this.ruleset = ruleset
    return this
  }

  async scheduleRulesetValidation(data: T): Promise<Validation<T>> {
    if (this.ruleset.length === 0) {
      throw new Error("Ruleset is not set")
    }

    await this.constructValidationObject(data)
    this.validateRuleset(data)

    return this.validationResult
  }

  async validateRuleset(data: T): Promise<Validation<T>> {
    if (this.ruleset.length === 0) {
      throw new Error("Ruleset is not set")
    }

    if (!this.validation) {
      await this.constructValidationObject(data) // Override flow for testing
    }

    for await (const rule of this.ruleset.filter(({ skip }) => !skip)) {
      const evaluationResult = await this.evaluateRule(rule, data)
      await this.reviewEvaluationResult(evaluationResult, rule)
    }

    await this.afterValidation()

    return this.validationResult
  }

  async validateSingleRule(data: T): Promise<Validation<T>> {
    if (this.ruleset.length === 0) {
      throw new Error("Ruleset is not set")
    }

    const [rule] = this.ruleset
    await this.constructValidationObject(data)

    const evaluationResult = await this.evaluateRule(rule, data)
    await this.reviewEvaluationResult(evaluationResult, rule)

    await this.afterValidation()

    return this.validationResult
  }

  private async constructValidationObject(data: T) {
    const validationId = await this.createValidationId()

    this.validation = {
      validationId,
      totalChecks: this.ruleset.length,
      runnedChecks: 0,
      currentlyRunning: undefined,
      skippedChecks: this.ruleset.filter((rule) => rule.skip).map(({ name }) => name),
      additionalInfo: {
        startDate: new Date().toISOString(),
        customerInformation: data,
      },
      events: this.ruleset
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
    await this.pushToDatastore()
  }

  private async evaluateRule(rule: ValidationRule, data: T): Promise<EvaluationResult> {
    const { endpoint, retryStrategy, condition, name } = rule

    const validationEvent = this.validation.events.find((event) => event.name === name)
    if (validationEvent) {
      validationEvent.dateStarted = new Date().toISOString()
      validationEvent.status = "RUNNING"
      await this.pushToDatastore()
    }

    const { error, data: responseData } = await Agent.fireRequest(rule, {
      customer: data,
      secrets: this.secrets,
    })

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
    return evaluator.evaluate({
      response: responseData,
      customer: data,
      secrets: this.secrets,
    })
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
    this.validation.runnedChecks++

    await this.pushToDatastore()
  }

  private async pushToDatastore() {
    const { validationId } = this.validation
    await this.store.set(DataStore.getValidationKey(validationId), JSON.stringify(this.validationResult))
    EventBus.emit(`${EventBus.EVENTS.VALIDATION_EVENT_UPDATE}--${validationId}`, this.validationResult)
  }

  private async createValidationId(): Promise<Validation["validationId"]> {
    const id = v4() // TODO See if id exists on DB and use `v4` to create UUID
    return id
  }

  private async afterValidation() {
    this.validation.additionalInfo.endDate = new Date().toISOString()

    EventBus.emit(`${EventBus.EVENTS.VALIDATION_DONE}--${this.validation.validationId}`)
    Notification.publish(JSON.stringify(this.validationResult))
    // console.log(this.validationResult)
  }
}
