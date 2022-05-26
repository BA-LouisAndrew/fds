import { BooleanConditionEvaluator } from "@/engine/condition/booleanConditionEvaluator"
import { ConditionEvaluator } from "@/engine/condition/conditionEvaluator"
import { Condition } from "@/types/rule"

describe("Evaluator", () => {
  describe("Condition Evaluator", () => {
    const condition: Condition = {
      path: "$.statusCode",
      operator: "eq",
      type: "number",
      value: 200,
      failMessage: "Status code doesn't equal to 200",
    }
    const evaluator = new ConditionEvaluator(condition)

    it("returns the correct result for a valid data", () => {
      const { pass, messages } = evaluator.evaluate({
        statusCode: 200,
      })

      expect(pass).toBeTruthy()
      expect(messages).toEqual([])
    })

    it("returns the correct result for a non-valid data", () => {
      const { pass, messages } = evaluator.evaluate({
        statusCode: 300,
      })

      expect(pass).toBeFalsy()
      expect(messages).toEqual([condition.failMessage])
    })

    it("returns a proper message if path is not accessible", () => {
      const { pass, messages } = evaluator.evaluate({
        status: 200,
        foo: "bar",
      })

      expect(pass).toBeFalsy()
      expect(messages).toEqual(["Path $.statusCode is not reachable. Available paths: ($.status, $.foo)"])
    })

    it("returns the proper message if failMessage contains the special `$` identifier", () => {
      const e = new ConditionEvaluator({
        ...condition,
        failMessage: "Status code doesn't equal to 200. Received: $",
      })

      const { messages } = e.evaluate({
        statusCode: 300,
      })

      expect(messages).toEqual(["Status code doesn't equal to 200. Received: 300"])
    })
  })
  
  describe("Boolean condition evaluator", () => {
    const conditions: Condition[] = [{
      path: "$.statusCode",
      operator: "eq",
      type: "number",
      value: 200,
      failMessage: "Status code doesn't equal to 200",
    }, {
      path: "$.success",
      operator: "eq",
      type: "boolean",
      value: true,
      failMessage: "Not a successful operation"
    }]
    
    describe("ANY Boolean evaluator", () => {
      const evaluator = new BooleanConditionEvaluator({
        any: conditions
      })
      
      it("passes the evaluation if one of the condition passed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 200,
          success: false
        })
        
        expect(pass).toBeTruthy()
        expect(messages).toEqual(["Not a successful operation"])
      })

      it("fails the evaluation if both of the conditions failed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 300,
          success: false
        })

        expect(pass).toBeFalsy()
        expect(messages).toContain("Not a successful operation")
        expect(messages).toContain("Status code doesn't equal to 200")
      })
      
      it("passes the evaluation if both of the condition passed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 200,
          success: true
        })
      
        expect(pass).toBeTruthy()
        expect(messages).toEqual([])
      })
    })
    
    describe("ALL Boolean evaluator" , () => {
      const evaluator = new BooleanConditionEvaluator({
        all: conditions
      })
    
      it("fails the evaluation if only one of the condition passed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 200,
          success: false
        })
      
        expect(pass).toBeFalsy()
        expect(messages).toEqual(["Not a successful operation"])
      })

      it("fails the evaluation if both of the conditions failed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 300,
          success: false
        })

        expect(pass).toBeFalsy()
        expect(messages).toContain("Not a successful operation")
        expect(messages).toContain("Status code doesn't equal to 200")
      })
    
      it("passes the evaluation if both of the condition passed", () => {
        const { pass, messages } = evaluator.evaluate({
          statusCode: 200,
          success: true
        })
    
        expect(pass).toBeTruthy()
        expect(messages).toEqual([])
      })
    })
  })

  it("fails the evaluation if the condition is not appropriate", () => {
    const evaluator = new BooleanConditionEvaluator({})

    const { pass, messages } = evaluator.evaluate({
      statusCode: 200
    })
    
    expect(pass).toBeFalsy()
    expect(messages).toEqual(["Condition invalid! Please use either `any` or `all`"])
  })
})
