import { numberOperators } from "@/engine/operators/numberOperator"

describe("Number operators", () => {
  it("Eq: returns the correct value", () => {
    const op = numberOperators.eq

    expect(op.operate(1, 1)).toBeTruthy()
    expect(op.operate(1234556, 1234556)).toBeTruthy()

    expect(op.operate(1.2, 1.1)).toBeFalsy()
    expect(op.operate(123456, 123455)).toBeFalsy()
  })

  it("Gt: returns the correct value", () => {
    const op = numberOperators.gt

    expect(op.operate(1, 2)).toBeTruthy()
    expect(op.operate(1.1, 1.101)).toBeTruthy()

    expect(op.operate(1, 1)).toBeFalsy()
    expect(op.operate(1.1, 1)).toBeFalsy()
  })

  it("Gte: returns the correct value", () => {
    const op = numberOperators.gte

    expect(op.operate(1, 2)).toBeTruthy()
    expect(op.operate(1.1, 1.1)).toBeTruthy()
    expect(op.operate(1.01, 1.0101)).toBeTruthy()

    expect(op.operate(1.011, 1.001)).toBeFalsy()
    expect(op.operate(2, 1)).toBeFalsy()
  })

  it("Lt: returns the correct value", () => {
    const op = numberOperators.lt

    expect(op.operate(2, 1)).toBeTruthy()
    expect(op.operate(1.101, 1.1)).toBeTruthy()

    expect(op.operate(1, 1)).toBeFalsy()
    expect(op.operate(1, 1.1)).toBeFalsy()
  })

  it("Lte: returns the correct value", () => {
    const op = numberOperators.lte

    expect(op.operate(2, 1)).toBeTruthy()
    expect(op.operate(1.1, 1.1)).toBeTruthy()
    expect(op.operate(1.0101, 1.01)).toBeTruthy()

    expect(op.operate(1.001, 1.011)).toBeFalsy()
    expect(op.operate(1, 2)).toBeFalsy()
  })
})
