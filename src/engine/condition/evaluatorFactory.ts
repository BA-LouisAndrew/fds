import { BooleanCondition, Condition } from "@/types/rule"

import { BooleanConditionEvaluator } from "./booleanConditionEvaluator"
import { ConditionEvaluator } from "./conditionEvaluator"
import { Evaluator, NullishEvaluator } from "./evaluator"

export class EvaluatorFactory {
  static getEvaluator(condition: Condition | BooleanCondition) {
    const isBooleanCondition = BooleanConditionEvaluator.getBooleanIdentifier(condition) !== "null"
    if (isBooleanCondition) {
      return new BooleanConditionEvaluator(condition as BooleanCondition)
    }

    const isConditionValid = Evaluator.isConditionValid(condition)

    return isConditionValid
      ? new ConditionEvaluator(condition as Condition)
      : new NullishEvaluator(condition as Condition)
  }
}
