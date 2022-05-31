import { Response as ExResponse } from "express"

import { DataStore } from "@/engine/data/dataStore"
import { ValidationEngine } from "@/engine/validationEngine"
import { EventBus } from "@/eventBus"
import { ApiResponse } from "@/types/api"
import { Customer } from "@/types/customer"
import { MinifiedValidation, Validation } from "@/types/validation"

import { RulesService } from "../rules/rulesService"

export type ValidationSchedule = Pick<Validation, "validationId" | "additionalInfo">

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

    EventBus.once(closeEvent, () => {
      writeToStream({ close: true })
    })

    EventBus.on(updateEvent, (validationResult: Validation) => {
      writeToStream(validationResult)
    })

    const closeConnection = () => {
      console.log("closing connection")
      EventBus.off(updateEvent)
      responseObject.end()
    }

    const writeToStream = (data: any) => responseObject.write(`data: ${JSON.stringify(data)}\n\n`)

    if (currentProgress.error) {
      writeToStream({
        ...currentProgress.error,
        error: true,
      })
      closeConnection()
      return
    }

    writeToStream(currentProgress.data)

    responseObject.on("close", closeConnection)
  }

  static async getValidationProgress(validationId: string): Promise<ApiResponse<MinifiedValidation | Validation>> {
    try {
      const stringifiedValue = await DataStore.getInstance().get(validationId)
      const errorObject = {
        data: null,
        error: {
          message: `Validation \`${validationId}\` not found`,
          details: "The validation either doesn't exist, or is deleted from the cache",
        },
      }

      if (!stringifiedValue) {
        return errorObject
      }

      const value = this.parseStringifiedValidation(stringifiedValue)
      if (!value) {
        return errorObject
      }

      return {
        error: null,
        data: value,
      }
    } catch (e) {
      return {
        data: null,
        error: {
          message: e,
        },
      }
    }
  }

  static async getValidationList(): Promise<ApiResponse<MinifiedValidation[]>> {
    try {
      const validationStrings = await DataStore.getInstance().list(DataStore.VALIDATION_PREFIX)

      const validationList = validationStrings
        .map((stringifiedValue) => this.parseStringifiedValidation(stringifiedValue, true))
        .filter(Boolean) as MinifiedValidation[]

      return {
        data: validationList,
        error: null,
      }
    } catch (e) {
      return {
        data: null,
        error: {
          message: e,
        },
      }
    }
  }

  static parseStringifiedValidation(stringifiedValue: string, minify = false): Validation | MinifiedValidation | null {
    try {
      const parsedValue: Validation = JSON.parse(stringifiedValue)
      if (!minify) {
        return parsedValue
      }

      const { validationId, totalChecks, runnedChecks, fraudScore, skippedChecks } = parsedValue
      return {
        validationId,
        totalChecks,
        runnedChecks,
        fraudScore,
        skippedChecks,
      }
    } catch {
      return null
    }
  }
}
