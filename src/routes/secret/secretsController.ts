import { Body, Controller, Delete, Get, Path, Post, Put, Response, Route, SuccessResponse, Tags } from "tsoa"

import { ValidationErrorJSON, WentWrong } from "@/types/responses"
import { Secret } from "@/types/secret"

import { SecretsService } from "./secretsService"

@Route("secrets")
@Tags("Secrets")
export class SecretsController extends Controller {
  /**
   * Retrieves all keys of existing secrets.
   */
  @Get()
  public async listSecrets(): Promise<string[]> {
    const { data } = await SecretsService.listSecretKeys()
    return data
  }

  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Response<WentWrong>(400, "Bad Request")
  @SuccessResponse(201, "Created")
  @Post()
  public async createRule(@Body() requestBody: Secret): Promise<void | WentWrong> {
    const { error } = await SecretsService.createSecretEntry(requestBody)
    if (error) {
      this.setStatus(400)
      return {
        message: "Bad Request",
        details: error.message,
      }
    }

    this.setStatus(201)
  }

  @Response<ValidationErrorJSON>(422, "Validation Failed")
  @Response<WentWrong>(404, "Not Found")
  @Put("{secretKey}")
  public async updateRule(
    @Path() secretKey: string,
    @Body() requestBody: Pick<Secret, "value">,
  ): Promise<void | WentWrong> {
    const { error } = await SecretsService.updateSecretValue({
      key: secretKey,
      value: requestBody.value,
    })

    if (error) {
      this.setStatus(404)
      return {
        message: "Not Found",
        details: error.message,
      }
    }

    this.setStatus(200)
  }

  @Response<WentWrong>(400, "Bad Request")
  @SuccessResponse(204, "Deleted")
  @Delete("{secretKey}")
  public async deleteRule(@Path() secretKey: string): Promise<void | WentWrong> {
    const { error } = await SecretsService.deleteSecretEntry(secretKey)
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
