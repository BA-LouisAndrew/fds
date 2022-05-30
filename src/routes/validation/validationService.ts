import { ValidationEngine } from "@/engine/validationEngine"
import { ApiResponse } from "@/types/api"
import { Customer } from "@/types/customer"
import { Validation } from "@/types/validation"

import { RulesService } from "../rules/rulesService"

export type ValidationSchedule = Pick<Validation, "validationId" | "additionalInfo">;

export class ValidationService {
  static async scheduleRulesetValidation(customer: Customer): Promise<ApiResponse<ValidationSchedule>> {
    const { data: ruleset, error } = await RulesService.listRules()
    if (error) {
      return {
        data: null,
        error,
      }
    }

    const { validationId, additionalInfo } = await new ValidationEngine<Customer>().scheduleRulesetValidation(ruleset, customer)
    return {
      data: {
        validationId,
        additionalInfo,
      },
      error: null,
    }
  }
}
