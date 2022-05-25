import { ArrayOperatorIds } from "@/types/operators"

import { Operator } from "./operator"

export class ArrayOperator extends Operator<
  number | string | boolean,
  ArrayOperatorIds,
  (number | string | boolean)[]
> {
  protected validateFunction = (value) => {
    console.log("native")
    if (value === null || value === undefined) {
      return false
    }
    return typeof value === "string" || typeof value === "number"
  }
}

export const arrayOperators: Record<ArrayOperatorIds, ArrayOperator> = {
  empty: new ArrayOperator("empty", (a, b) => (a ? b.length === 0 : b.length !== 0)).setValidateFunction(
    (a) => typeof a === "boolean",
  ),
  excl: new ArrayOperator("excl", (a, b) => b.indexOf(a) === -1),
  incl: new ArrayOperator("incl", (a, b) => b.indexOf(a) !== -1),
  len: new ArrayOperator("len", (a, b) => b.length === a).setValidateFunction((a) => typeof a === "number"),
}
