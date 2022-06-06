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

  @Post("/is-email-domain-blacklisted")
  public async isUserEmailDomainBlacklisted(
    @Body() requestBody: { email: string },
    @Query() timeout?: number,
  ): Promise<{ data: boolean }> {
    const data = await UtilityService.withTimeout(UtilityService.isEmailDomainBlacklisted(requestBody.email), timeout)
    return { data }
  }

  @Post("/is-user-registered-in-external-service")
  public async isUserRegistered(
    @Body() requestBody: { lastName: string },
    @Query() timeout?: number,
  ): Promise<{ registered: boolean }> {
    const registered = await UtilityService.withTimeout(
      UtilityService.isUserRegisteredInExternalDomain(requestBody.lastName),
      timeout,
    )

    return { registered }
  }

  @Get("/blacklisted-emails")
  public async getBlacklistedEmails(@Query() timeout?: number): Promise<{ blacklistedEmails: string[] }> {
    const blacklistedEmails = await UtilityService.withTimeout(UtilityService.getBlacklistedEmails(), timeout)
    return {
      blacklistedEmails,
    }
  }

  @Get("/operating-countries")
  public async getOperatingCountries(@Query() timeout?: number): Promise<{ operatingCountries: string[] }> {
    const operatingCountries = await UtilityService.withTimeout(UtilityService.getOperatingCountries(), timeout)
    return {
      operatingCountries,
    }
  }
}
