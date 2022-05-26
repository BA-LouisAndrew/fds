import jp from "jsonpath"

import { BooleanCondition, Condition } from "@/types/rule"

export type EvaluationResult = { messages: string[]; pass: boolean };
const conditionKeys = ["path", "operator", "type", "value", "failMessage"]

export class Evaluator<T extends Condition | BooleanCondition> {
  static isConditionValid(condition: any) {
    return condition !== null && Object.keys(condition).every((key) => conditionKeys.indexOf(key) !== -1)
  }

  protected result: EvaluationResult
  protected condition: T

  constructor(condition: T) {
    this.condition = condition
    this.result = { messages: [], pass: false }
  }

  evaluate(data: any): EvaluationResult {
    this.runEvaluation(data)
    return this.returnEvaluationResult()
  }

  protected runEvaluation(_: any) {
    throw new Error("Evalution not implemented")
  }

  protected returnEvaluationResult(): EvaluationResult {
    const result = this.result
    this.flush()
    return result
  }

  protected flush() {
    this.result = { messages: [], pass: false }
  }

  protected accessDataFromPath(data: any, path: string): any | null {
    const dataFromPath = jp.query(data, path)
    if (dataFromPath.length === 0) {
      this.result.messages.push(`Path ${path} is not reachable. Available paths: ${this.formatAccessiblePaths(data)}`)
      if (data.body) {
        this.result.messages.push(`Accessible paths on $.body: ${this.formatAccessiblePaths(data.body)}`)
      }
      return null
    }

    return dataFromPath[0]
  }

  private formatAccessiblePaths(data: any): string {
    return `(${Object.keys(data)
      .map((key) => `$.${key}`)
      .join(", ")})`
  }

  protected formatMessage(message: string, value: any): string {
    const IDENTIFIER = "$"
    if (message.includes(IDENTIFIER)) {
      return message.split(IDENTIFIER).join(value)
    }

    return message
  }
}

export class NullishEvaluator extends Evaluator<Condition> {
  protected runEvaluation(): void {
    this.result.pass = false
    this.result.messages.push(`Condition invalid! Required properties are: (${conditionKeys.join(", ")})`)
  }
}
