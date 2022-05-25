import { StringOperatorIds } from "@/types/operators"

import { Operator } from "./operator"

export class StringOperator extends Operator<string, StringOperatorIds> {
  protected validateFunction = (value) => typeof value === "string"
}

export const stringOperators: Record<StringOperatorIds, StringOperator> = {
  eq: new StringOperator("eq", (a, b) => a === b),
  starts: new StringOperator("starts", (a, b) => b.startsWith(a)),
  ends: new StringOperator("ends", (a, b) => b.endsWith(a)),
  incl: new StringOperator("incl", (a, b) => b.includes(a)),
}
