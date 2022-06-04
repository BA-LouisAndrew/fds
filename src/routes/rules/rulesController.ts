import { Body, Controller, Delete, Example, Get, Path, Post, Put, Response, Route, SuccessResponse, Tags } from "tsoa"

import { sampleRule } from "@/seed/rule"
import { NotFound, ValidationErrorJSON, WentWrong } from "@/types/responses"
import { ValidationRule } from "@/types/rule"

import { RulesService, UpdateRuleRequestBody } from "./rulesService"

@Route("rules")
@Tags("Rules")
export class RulesController extends Controller {
  /**
   * Retrieves all of existing validation rules.
   */
  @Example<ValidationRule[]>([sampleRule])
  @Get()
  public async listRules(): Promise<ValidationRule[]> {
    const { data, error } = await RulesService.listRules()
    if (error) {
      return []
    }
    return data
  }

  /**
   * Retrieves details of an existing validation rule.
   * @param ruleName Unique name of the rule.
   */
  @Example<ValidationRule>(sampleRule)
  @Response<NotFound>(404, "Not Found")
  @Get("{ruleName}")
  public async getRule(@Path() ruleName: string): Promise<ValidationRule | NotFound> {
    const { data, error } = await RulesService.getRule(ruleName)
    if (error) {
      this.setStatus(404)
      return {
        message: error.message,
      }
    }

    return data
  }

  /**
   * Creates a new validation rule entry on the database.
   * @param requestBody Details of the validation rule.
   */
  @Example<ValidationRule>(sampleRule)
  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Response<WentWrong>(400, "Bad Request")
  @SuccessResponse(201, "Created")
  @Post()
  public async createRule(@Body() requestBody: ValidationRule): Promise<ValidationRule | WentWrong> {
    const { data, error } = await RulesService.createRule(requestBody)
    if (error) {
      this.setStatus(400)
      return {
        message: "Bad Request",
        details: error.message,
      }
    }

    return data
  }

  /**
   * Updates the details of an existing validation rule.
   * @param ruleName Unique name / identifier of the rule.
   * @param requestBody New, updated etails of the validation rule.
   */
  @Example<ValidationRule>(sampleRule)
  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Response<WentWrong>(404, "Not Found")
  @Put("{ruleName}")
  public async updateRule(
    @Path() ruleName: string,
    @Body() requestBody: UpdateRuleRequestBody,
  ): Promise<ValidationRule | WentWrong> {
    const { error, data } = await RulesService.updateRule(requestBody, ruleName)
    if (error) {
      this.setStatus(404)
      return {
        message: "Not Found",
        details: error.message,
      }
    }

    return data
  }

  /**
   * Deletes an existing validation rule from the database.
   * @param ruleName Unique name / identifier of the rule.
   */
  @Response<WentWrong>(400, "Bad Request")
  @SuccessResponse(204, "Deleted")
  @Delete("{ruleName}")
  public async deleteRule(@Path() ruleName: string): Promise<void | WentWrong> {
    const { error } = await RulesService.deleteRule(ruleName)
    if (error) {
      this.setStatus(400)
      return {
        message: "Bad Request",
        details: error.message,
      }
    }

    this.setStatus(204)
  }
}
