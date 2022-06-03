import { OperatorFactory } from "@/engine/operators/operatorFactory"
import { Condition } from "@/types/rule"

import { Evaluator } from "./evaluator"

export class ConditionEvaluator extends Evaluator<Condition> {
  protected runEvaluation(data: any): void {
    const { path, operator: operatorId, type, value, failMessage } = this.condition
    const dataFromPath = this.accessDataFromPath(data, path)
    const valueFromPath = this.accessDataFromPath(data, value)

    if (dataFromPath === null || dataFromPath === undefined) {
      this.result.pass = false
      return
    }

    const operator = OperatorFactory.getOperator(type, operatorId)
    const isValid = operator.operate(valueFromPath, dataFromPath)

    if (!isValid) {
      this.result.messages.push(this.formatMessage(failMessage, dataFromPath))
      this.result.pass = false
      return
    }

    this.result.pass = true
  }
}
