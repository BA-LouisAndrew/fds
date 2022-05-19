import { Body, Controller, Delete, Example, Get, Path, Post, Put, Response, Route, SuccessResponse, Tags } from "tsoa"

import { sampleRule } from "@/seed/rule"
import { NotFound, ValidationErrorJSON } from "@/types/responses"
import { ValidationRule } from "@/types/rule"

import { RulesService } from "./rulesService"

type UpdateRuleRequestBody = Partial<Omit<ValidationRule, "name">>;

@Route("rules")
@Tags("Rules")
export class RulesController extends Controller {
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
        message: error.message
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
  @SuccessResponse(201, "Created")
  @Post()
  public async createRule(@Body() requestBody: ValidationRule): Promise<ValidationRule> {
    const { data } = await RulesService.createRule(requestBody)
    return data as ValidationRule
  }

  /**
   * Updates the details of an existing validation rule.
   * @param ruleName Unique name / identifier of the rule.
   * @param requestBody New, updated etails of the validation rule.
   */
  @Example<ValidationRule>(sampleRule)
  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Response<NotFound>(404, "Not Found")
  @Put("{ruleName}")
  public async updateRule(
    @Path() ruleName: string,
    @Body() requestBody: UpdateRuleRequestBody,
  ): Promise<ValidationRule> {
    return {
      ...sampleRule,
      ...requestBody,
    }
  }

  /**
   * Deletes an existing validation rule from the database.
   * @param ruleName Unique name / identifier of the rule.
   */
  @SuccessResponse(204, "Deleted")
  @Delete("{ruleName}")
  public async deleteRule(@Path() ruleName: string): Promise<{ success: boolean }> {
    this.setStatus(204)
    return { success: true }
  }
}
