import { BooleanCondition, Condition } from "@/types/rule"

import { ConditionEvaluator } from "./conditionEvaluator"
import { EvaluationResult, Evaluator } from "./evaluator"

export class BooleanConditionEvaluator extends Evaluator<BooleanCondition> {
  static getBooleanIdentifier(condition: Condition | BooleanCondition): "any" | "all" | "null" {
    const keys = Object.keys(condition)
    const isUsingAny = keys.includes("any")
    const isUsingAll = keys.includes("all")

    if (isUsingAll && isUsingAny) {
      return "null"
    }

    if (!isUsingAll && !isUsingAny) {
      return "null"
    }

    return isUsingAll ? "all" : "any"
  }

  get booleanIdentifier() {
    return BooleanConditionEvaluator.getBooleanIdentifier(this.condition)
  }

  protected runEvaluation(data: any): void {
    if (this.booleanIdentifier === "null") {
      this.result.pass = false
      this.result.messages.push("Condition invalid! Please use either `any` or `all`")
      return
    }

    const conditions = this.condition[this.booleanIdentifier]!
    const conditionsResults = conditions.map((condition) => new ConditionEvaluator(condition).evaluate(data))

    this.result.pass =
      this.booleanIdentifier === "all"
        ? conditionsResults.every(({ pass }) => pass)
        : conditionsResults.some(({ pass }) => pass)

    this.result.messages = this.mergeMessages(conditionsResults)
  }

  private mergeMessages(results: EvaluationResult[]): string[] {
    return results.flatMap(({ messages }) => messages)
  }
}
