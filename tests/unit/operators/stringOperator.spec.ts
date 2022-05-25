import { stringOperators } from "@/engine/operators/stringOperator"

describe("String operators", () => {

  it("Eq: returns the correct value", () => {
    const operation = stringOperators.eq

    expect(operation.operate("HELLO MOM", "HELLO MOM")).toBeTruthy()
    expect(operation.operate("hi there", "hi there")).toBeTruthy()

    expect(operation.operate("HELLO MOM" , "hELLO MOM")).toBeFalsy()
    expect(operation.operate("HELLO MOM", "HELLO MO")).toBeFalsy()
  })

  it("Starts: returns the correct value", () => {
    const operation = stringOperators.starts
   
    expect(operation.operate("HELLO", "HELLO MOM")).toBeTruthy()
    expect(operation.operate("H", "HELLO MOM")).toBeTruthy()

    expect(operation.operate("h", "HELLO MOM")).toBeFalsy()
    expect(operation.operate("E", "HELLO MOM")).toBeFalsy()
  })
 
  it("Ends: returns the correct value", () => {
    const operation = stringOperators.ends

    expect(operation.operate("M", "HELLO MOM")).toBeTruthy()
    expect(operation.operate(" MOM", "HELLO MOM")).toBeTruthy()

    expect(operation.operate("m", "HELLO MOM")).toBeFalsy()
    expect(operation.operate("ee", "HELLO MOM")).toBeFalsy()
  })
 
  it("Incl: returns the correct value", () => {
    const operation = stringOperators.incl

    expect(operation.operate("ELLO ", "HELLO MOM")).toBeTruthy()
    expect(operation.operate("E", "HELLO MOM")).toBeTruthy()

    expect(operation.operate("e", "HELLO MOM")).toBeFalsy()
    expect(operation.operate("EALO", "HELLO MOM")).toBeFalsy()
  })
})