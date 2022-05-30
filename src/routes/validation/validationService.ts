import { Response as ExResponse } from "express"

import { DataStore } from "@/engine/data/dataStore"
import { ValidationEngine } from "@/engine/validationEngine"
import { EventBus } from "@/eventBus"
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

    const { validationId, additionalInfo } = await new ValidationEngine<Customer>().scheduleRulesetValidation(
      ruleset,
      customer,
    )
    return {
      data: {
        validationId,
        additionalInfo,
      },
      error: null,
    }
  }

  static async subscribeToValidationProgress(validationId: string, responseObject: ExResponse): Promise<void> {
    const updateEvent = `${EventBus.EVENTS.VALIDATION_EVENT_UPDATE}--${validationId}`
    const closeEvent = `${EventBus.EVENTS.VALIDATION_DONE}--${validationId}`
    
    const currentProgress = await ValidationService.getValidationProgress(validationId)
    console.log(currentProgress)	
    
    EventBus.on(updateEvent, (validationResult: Validation) => {
      writeToStream(validationResult)
    })

    const closeConnection = () => {
      console.log("closing connection")	
      EventBus.off(updateEvent)
      responseObject.end()
    }

    const writeToStream = (data: any) => {
      responseObject.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    if (currentProgress.error) {
      writeToStream(currentProgress.error)
      closeConnection()
      return
    }

    writeToStream(currentProgress.data)

    EventBus.once(closeEvent, () => {
      writeToStream({ close: true })
    })

    responseObject.on("close", closeConnection)
  }

  static async getValidationProgress(validationId: string): Promise<ApiResponse<Validation>> {
    const validation = await DataStore.getInstance().get(validationId)
    const errorObject = {
      data: null,
      error: {
        message: `Validation \`${validationId}\` not found`,
        details: "The validation either doesn't exist, or is deleted from the cache",
      },
    }
    
    console.log(validation)	

    if (!validation) {
      return errorObject
    }

    try {
      const result = JSON.parse(validation)
      return {
        data: result as Validation,
        error: null,
      }
    } catch {
      return errorObject
    }
  }
}
