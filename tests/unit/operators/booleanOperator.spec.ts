import { booleanOperators } from "@/engine/operators/booleanOperator"

describe("Boolean operator", () => {
  it("Eq: returns the correct value", () => {
    const op = booleanOperators.eq

    expect(op.operate(true, true)).toBeTruthy()
    expect(op.operate(false, false)).toBeTruthy()

    expect(op.operate(true, false)).toBeFalsy()
    expect(op.operate(false, true)).toBeFalsy()
  })
})