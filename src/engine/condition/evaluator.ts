import { BooleanCondition, Condition } from "@/types/rule"

type EvaluationResult = { messages: string[]; pass: boolean };

export class Evaluator<T extends Condition | BooleanCondition> {
  private result: EvaluationResult = { messages: [], pass: false }
  private condition: T

  constructor(condition: T) {
    this.condition = condition
  }

  evaluate(data: any): EvaluationResult {
    return this.result
  }

  flush() {
    this.result = { messages: [], pass: false }
  }

  formatMessage(message: string, value: any): string {
    return ""
  }
}
