import { NumberOperatorIds } from "@/types/operators"

import { Operator } from "./operator"

export class NumberOperator extends Operator<number, NumberOperatorIds> {
  protected validateFunction = (value) => typeof value === "number" && !isNaN(parseFloat(`${value}`))
}

export const numberOperators: Record<NumberOperatorIds, NumberOperator> = {
  eq: new NumberOperator("eq", (a, b) => a === b),
  gt: new NumberOperator("gt", (a, b) => b > a),
  gte: new NumberOperator("gte", (a, b) => b >= a),
  lt: new NumberOperator("lt", (a, b) => b < a),
  lte: new NumberOperator("lte", (a, b) => b <= a),
}