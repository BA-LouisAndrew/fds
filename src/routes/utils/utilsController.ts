import { Body, Controller, Get, Post, Route, Tags } from "tsoa"

import { UtilityService } from "./utilsService"

type NameValidationReturnType = {
  success: boolean;
  valid: string;
};

/**
 * Utility endpoints for testing purposes.
 */
@Route("utils")
@Tags("Utils")
export class UtilityController extends Controller {
  @Post("/nameValidation")
  public async validateCustomerName(@Body() requestBody: { name: string }): Promise<NameValidationReturnType> {
    const isNameValid = UtilityService.validateName(requestBody.name)
    if (isNameValid) {
      return {
        success: true,
        valid: "valid",
      }
    }

    return {
      success: false,
      valid: "invalid",
    }
  }

  @Get("/alwaysTrue")
  public async alwaysTrueValidation(): Promise<{ success: boolean }> {
    return {
      success: true,
    }
  }
}
