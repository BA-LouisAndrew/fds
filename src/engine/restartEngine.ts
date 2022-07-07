import { RulesService } from "@/routes/rules/rulesService"
import { SecretsService } from "@/routes/secret/secretsService"
import { ValidationService } from "@/routes/validation/validationService"
import { Customer } from "@/types/customer"

import { ValidationEngine } from "./validationEngine"

export class RestartEngine {
  static async runSuspendedValidations() {
    const validationList = await ValidationService.getFullValidationList()
    if (validationList.error) {
      return
    }

    const suspended = validationList.data.filter(
      ({ runnedChecks, totalChecks, skippedChecks }) => totalChecks - skippedChecks.length > runnedChecks,
    )

    if (suspended.length > 0) {
      const { data: ruleset, error } = await RulesService.listRules()
      const secrets = await SecretsService.listSecrets()
      if (error) {
        return
      }

      suspended.forEach((validation) => {
        new ValidationEngine<Customer>()
          .setRuleset(ruleset)
          .setSecrets(secrets)
          .setValidation(validation)
          .validateRuleset(validation.additionalInfo.customerInformation!)
      })
    }
  }
}
