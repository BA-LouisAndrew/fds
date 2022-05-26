import { ValidationRule } from "@prisma/client"
import { Request as ExRequest, Response as ExResponse } from "express"
import { Body, Controller, Example, Get, Path, Post, Response,Route, SuccessResponse, Tags } from "tsoa"

import { EvaluationResult } from "@/engine/condition/evaluator"
import { ValidationEngine } from "@/engine/validationEngine"
import { sampleCustomer } from "@/seed/customer"
import { sampleValidation } from "@/seed/validation"
import { Customer } from "@/types/customer"
import { NotFound, ValidationErrorJSON } from "@/types/responses"
import { Validation } from "@/types/validation"

import { RulesService } from "../rules/rulesService"

@Route("validate")
@Tags("Validation")
export class ValidationController extends Controller {

  /**
  * Execute a new validation process for a specified customer entity.
  * @param requestBody Customer, on which the validation should be executed.
  */
  @Example<Customer>(sampleCustomer)
  @SuccessResponse(201, "Validation started")
  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Post()
  public async validateCustomer(@Body() requestBody: Customer): Promise<Validation> {
    return sampleValidation
  }
 
 /**
  * Retrieves the latest progress of a validation process. 
  * This endpoint only return the latest progress of the validation. 
  * 
  * To listen to the realtime events of the validation, please fire an HTTP GET request to `/validate/:validationId/subscribe`.
  * 
  * Please visit [TODO] to try it live. 
  * 
  * @param validationId Unique identifier of the validation (UUIDv4). 
  * Please take a look at [RFC 4112](https://tools.ietf.org/html/rfc4122) for more info.
  * @pattern validationId [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
  * @example validationId "52907745-7672-470e-a803-a2f8feb52944"
  */
 @Example<Validation>(sampleValidation)
 @Get("{validationId}")
 @Response<NotFound>(404, "Not Found")
  public async getValidationProgress(@Path() validationId: Validation["validationId"]): Promise<Validation> {
    return {
      ...sampleValidation,
      validationId,
    }
  }

  /**
   * Testing endpoint to execute a validation on a **SINGLE** rule.
   * @param requestBody 
   * @param ruleName 
   */
  @Response<NotFound>(404, "Not Found")
  @Post("/single/{ruleName}")
 public async validateSingleRule(@Body() requestBody: Customer, @Path() ruleName: ValidationRule["name"]): Promise<EvaluationResult | NotFound> {
   const { data, error } = await RulesService.getRule(ruleName)
   if (error) {
     this.setStatus(404)
     return {
       message: error.message,
     }
   }

   return await new ValidationEngine().validateSingleRule(data)
 }
}

export const subscribeToValidationProgress = async (request: ExRequest, response: ExResponse) => {
  response.send("Hi mom")
}