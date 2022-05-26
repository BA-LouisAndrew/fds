import { ValidationRule } from "@/types/rule"

import { EvaluationResult } from "./condition/evaluator"

export class ValidationEngine {
  
  
  async validateSingleRule(rule: ValidationRule): Promise<EvaluationResult> {
    // TODO
    console.log({ rule })	
    return {
      pass: false,
      messages: ["Not implemented!"]
    }
  }
}