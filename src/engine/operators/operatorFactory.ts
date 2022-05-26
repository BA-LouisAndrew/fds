import { OperatorType } from "@/types/operators"
import { ConditionType } from "@/types/rule"

import { arrayOperators } from "./arrayOperator"
import { booleanOperators } from "./booleanOperator"
import { numberOperators } from "./numberOperator"
import { Operator } from "./operator"
import { stringOperators } from "./stringOperator"

// Factory pattern?
export class OperatorFactory {
  static readonly nullishOperator = new Operator("null", () => false)
  private static readonly operatorMap = {
    string: stringOperators,
    number: numberOperators,
    array: arrayOperators,
    boolean: booleanOperators
  }
 
  static getOperator(type: ConditionType, operatorId: OperatorType): Operator {
    const operatorGroup = this.operatorMap[type]
    if (!operatorGroup) {
      return this.nullishOperator
    }

    const operator = operatorGroup[operatorId]
    if (!operator) {
      return this.nullishOperator
    }
    
    return operator as Operator
  }
}