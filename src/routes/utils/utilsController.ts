import { Body, Controller, Get, Post, Query, Route, Tags } from "tsoa"

import { UtilityService } from "./utilsService"

type NameValidationReturnType = {
  success: boolean
  valid: string
}

/**
 * Utility endpoints for testing purposes.
 */
@Route("utils")
@Tags("Utils")
export class UtilityController extends Controller {
  @Post("/nameValidation")
  public async validateCustomerName(
    @Body() requestBody: { name: string },
    @Query() timeout?: number,
  ): Promise<NameValidationReturnType> {
    const isNameValid = await UtilityService.validateName(requestBody.name, timeout)
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
  public async alwaysTrueValidation(@Query() timeout?: number): Promise<{ success: boolean }> {
    return {
      success: await UtilityService.alwaysTrue(timeout),
    }
  }

  @Get("/printCache")
  public async printCache(): Promise<{ data: any }> {
    return {
      data: JSON.parse(await UtilityService.printCache()),
    }
  }
}
