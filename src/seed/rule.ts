import { resolveTSType } from "@/engine/database/resolver"
import { ValidationRule } from "@/types/rule"

export const sampleRule: ValidationRule = {
  skip: false,
  condition: {
    path: "$.response.statusCode",
    operator: "eq",
    type: "number",
    value: 200,
    failMessage: "Status code doesn't equal to 200",
  },
  name: "sample-rule",
  priority: 0,
  endpoint: "http://localhost/5001/validate",
  method: "GET",
  failScore: 0.1,
}

export const sampleRuleWithBoolCondition: ValidationRule = {
  ...sampleRule,
  condition: {
    any: [
      {
        path: "$.response.statusCode",
        operator: "eq",
        value: 200,
        failMessage: "Status code doesn't equal to 200",
        type: "number",
      },
      {
        path: "$.response.body.success",
        operator: "eq",
        type: "boolean",
        value: true,
        failMessage: "Message doesn't seem right!",
      },
    ],
  },
}

export const prismaValidationRule = {
  id: "",
  ...resolveTSType(sampleRule),
}
