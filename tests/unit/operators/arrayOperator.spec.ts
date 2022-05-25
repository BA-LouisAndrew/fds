import { arrayOperators } from "@/engine/operators/arrayOperator"

describe("Array operator", () => {
  const array = [1, 2, 3, 4]
  it("Empty: returns the correct value", () => {
    const op = arrayOperators.empty
    expect(op.operate(false, array)).toBeTruthy()
    expect(op.operate(true, [])).toBeTruthy()

    expect(op.operate(true, array)).toBeFalsy()
    expect(op.operate(false, [])).toBeFalsy()
    expect(op.operate("true", [])).toBeFalsy()
    expect(op.operate(1, [])).toBeFalsy()
  })

  it("Excl: returns the correct value", () => {
    const op = arrayOperators.excl
    expect(op.operate(5, array)).toBeTruthy()
    expect(op.operate(1, [])).toBeTruthy()

    expect(op.operate(1, array)).toBeFalsy()
    expect(op.operate(2, [2, 2, 2])).toBeFalsy()
  })

  it("Incl: returns the correct value", () => {
    const op = arrayOperators.incl
    expect(op.operate(1, array)).toBeTruthy()
    expect(op.operate(2, [2, 2, 2])).toBeTruthy()

    expect(op.operate(5, array)).toBeFalsy()
    expect(op.operate(1, [])).toBeFalsy()
  })

  it("Len: returns the correct value", () => {
    const op = arrayOperators.len
    expect(op.operate(array.length, array)).toBeTruthy()
    expect(op.operate(0, [])).toBeTruthy()

    expect(op.operate(1, array)).toBeFalsy()
    expect(op.operate(1, [])).toBeFalsy()
  })
})