import { adder } from "@/utils/adder"

describe("adder function", () => {
  it("returns the corect answer", () => {
    const answer = adder(1, 2)
    expect(answer).toEqual(3)
  })
})