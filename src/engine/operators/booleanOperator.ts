import { BooleanOperatorIds } from "@/types/operators"

import { Operator } from "./operator"

export class BooleanOperator extends Operator<boolean, BooleanOperatorIds> {
  protected validateFunction = (value: any) => typeof value === "boolean"
}

export const booleanOperators: Record<BooleanOperatorIds, BooleanOperator> = {
  eq: new BooleanOperator("eq", (a, b) => b === a),
}
